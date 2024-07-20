"use strict";

const fireCache = { db: null, bucket: null }
const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');

const firebaseCredentials = {
	"type": "service_account",
	"project_id": process.env.CHARTMAT_GOOGLE_PROJECT_ID,
	"private_key_id": process.env.CHARTMAT_PRIVATE_KEY_ID,
	"private_key": process.env.CHARTMAT_PRIVATE_KEY.replace(/\\n/g, '\n'),
	"client_email": process.env.CHARTMAT_CLIENT_EMAIL,
	"client_id": process.env.CHARTMAT_CLIENT_ID,
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://oauth2.googleapis.com/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": process.env.CHARTMAT_CLIENT_X509_CERT_URL
}

const bucket_name = "chart-310113.appspot.com"

const database = module.exports = {
	get_firebase(v) {
		if (fireCache[v]) {
			return fireCache[v]
		}
		const credentials = { projectId: process.env.CHARTMAT_GOOGLE_PROJECT_ID, credentials: firebaseCredentials }
		if (v === 'storage') {
			const storage = new Storage(credentials)
			fireCache[v] = storage.bucket(bucket_name)  // Default bucket
			return fireCache[v]
		}
		else if (v === 'db') {
			fireCache[v] = new Firestore(credentials)
			return fireCache[v]
		}
	},

	connectToDatabase() {
		return database.get_firebase('db')
	},

	connectToStorage() {
		return database.get_firebase('storage')
	},

	async remove_file(url) {
		const bucket = await database.connectToStorage()
		const last_slash = url.lastIndexOf("/")
		const url_trail = url.substr(last_slash)
		const first_index_of_question = url_trail.indexOf("?")
		const filename = url_trail.substr(1, first_index_of_question - 1)
		const file_ref = await bucket.file(decodeURIComponent(filename))
		await file_ref.delete()
		return
	},
	async upload_file(file, file_name) {
		const path = `${Math.floor(Date.now())}-${file_name}`
		const bucket = await database.connectToStorage()
		const file_ref = await bucket.file(path)
		const downloadToken = [...Array(35)].map(() => (~~(Math.random() * 36)).toString(36)).join('')
		await file_ref.save(file, {
			destination: path,
			metadata: { metadata: { firebaseStorageDownloadTokens: downloadToken } }
		})
		const url = `https://firebasestorage.googleapis.com/v0/b/${bucket_name}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`
		return url
	},

	// async upload_file_image(file, file_name){
	// 	const template_image = `${Math.floor(Date.now())}-${file_name}`
	// 	const bucket = await database.connectToStorage()
	// 	const file_ref = await bucket.file(template_image)
	// 	const downloadToken = [ ...Array(35) ].map(() => (~~(Math.random() * 36)).toString(36)).join('')
	// 	await file_ref.save(file, {
	// 		destination_one: template_image,
	// 		metadata: { metadata:{ firebaseStorageDownloadTokens: downloadToken } }
	// 	})
	// 	const url = `https://firebasestorage.googleapis.com/v0/b/${bucket_name}/o/${encodeURIComponent(template_image)}?alt=media&token=${downloadToken}`
	// 	return url
	// },

	timestamp_sc() {
		// Return Timestamp in seconds as integer
		return parseInt(Math.floor(Date.now() / 1000))
	},

	random_id() {
		return `${new Date().getUTCMilliseconds().toString()}${Math.round((Math.random() * 36 ** 12)).toString(36)}`
	},

	// DB FUNCTIONS

	async add_one(collection_name, data) {
		// Returns the ID of the new object.
		const db = database.connectToDatabase()
		return await db.collection(collection_name).add(data).then(r => r.id)
	},

	async create_or_replace(collection_name, id, data) {
		// cache.del( `${collection_name}-${id}` )
		const db = database.connectToDatabase()
		return await db.collection(collection_name).doc(id).set(data)
	},

	async create_or_update(collection_name, id, data) {
		// cache.del( `${collection_name}-${id}` )
		const db = database.connectToDatabase()
		return await db.collection(collection_name).doc(id).set(data, { merge: true })
	},

	async update_one(collection_name, id, data) {
		// Returns null
		const db = database.connectToDatabase()
		return await db.collection(collection_name).doc(id).update(data)
	},

	async add_to_array(collection_name, id, array_name, new_value) {
		// Return Null
		const db = database.connectToDatabase()
		await db.collection(collection_name).doc(id).update({ [array_name]: Firestore.FieldValue.arrayUnion(new_value) })
	},

	async remove_from_array(collection_name, id, array_name, new_value) {
		// Return Null
		const db = database.connectToDatabase()
		await db.collection(collection_name).doc(id).update({ [array_name]: Firestore.FieldValue.arrayRemove(new_value) })
	},

	async get_id(collection_name, id) {
		// Returns the object without ID if it can't find it returns null
		const db = database.connectToDatabase()
		const item = await db.collection(collection_name).doc(id).get().then(v => v.data() || null)
		return item
	},

	async get_one(collection_name, filter) {
		// Returns the object or null
		const db = database.connectToDatabase()
		const all = await db.collection(collection_name).where(...filter).get()
			.then(snp => snp.docs.map(v => ({ ...v.data(), id: v.id })))
		if (all.length > 1) {
			console.log("Error: Get one returned multiple items: ", collection_name, filter)
			throw new Error("400::Get one returned multiple items")
		}
		return all.length ? all[0] : null
	},

	async get_one_double_filter(collection_name, filter_one, filter_two) {
		const db = database.connectToDatabase()
		const all = await db.collection(collection_name).where(...filter_one).where(...filter_two).get()
			.then(snp => snp.docs.map(v => ({ ...v.data(), id: v.id })))
		if (all.length > 1) {
			console.log("Error: Get one returned multiple items: ", collection_name, filter)
			throw new Error("400::Get one returned multiple items")
		}
		return all.length ? all[0] : null
	},

	async get_many(collection_name, filters) {
		// Returns an array of objects
		const db = database.connectToDatabase()
		const collection = db.collection(collection_name)
		if (filters) {
			return await collection.where(...filters).get().then(snp => snp.docs.map(v => ({ ...v.data(), id: v.id, })))
		}
		return await collection.get().then(snp => snp.docs.map(v => ({ ...v.data(), id: v.id, })))
	},

	async get_many_ids(collection_name, ids) {
		const db = database.connectToDatabase()
		const refs = ids.map(id => db.doc(`${collection_name}/${id}`))
		return db.getAll(...refs).then(docs => docs.map(v => ({ ...v.data(), id: v.id, })))
	},

	async delete_one(collection_name, id) {
		// Returns null
		const db = database.connectToDatabase()
		await db.collection(collection_name).doc(id).delete()
	},

	async add_many(collection_name, chunk) {
		const db = database.connectToDatabase()
		const batch = db.batch();
		for (const c of chunk) {
			var cRef = db.collection(collection_name).doc(c);
			batch.set(cRef, { appsumo_code: c });
		}
		await batch.commit()
		console.log("Batch loaded")
		return 
	},

	async delete_many(collection_name, filter) {
		// Returns null
		const db = database.connectToDatabase()
		await db.collection(collection_name).where(...filter).get()
			.then(snp => {
				const batch = db.batch();
				snp.forEach(doc => { batch.delete(doc.ref) })
				return batch.commit()
			})
			.then(() => null)
	},

	async delete_field(collection_name, filed_name, id) {
		const db = database.connectToDatabase()
		const item = await db.collection(collection_name).doc(id)
		await item.update({
			[filed_name]: Firestore.FieldValue.delete()
		})
	}

}
