<template>
  <div class="w-full relative">
    <div v-if="message" class="bg-slate-200 p-10 min-h-screen w-full">
      <p>{{ message }}</p>
      <div v-show="message.startsWith('Error')">
        <nuxt-link to="/admin" class="btn btn-indigo mt-6"
          >View All Boards</nuxt-link
        >
      </div>
    </div>

    <div v-if="!$auth.user">
      <div
        v-if="
          board.public === true &&
          board.sign_in_method === 'Use password set by admin' &&
          check_board_path != board.path
        "
        class="max-w-lg mx-auto items-center pt-10 md:pt-44"
      >
        <div
          :style="'padding: 25px; background:rgb(190,221,255); border-radius:1.25rem;'"
          class="border"
        >
          <h3 class="text-2xl text-center p-5">Login to {{ board.name }}</h3>

          <form
            accept-charset="UTF-8"
            v-on:submit.prevent="checkPassword()"
            method="POST"
          >
            <p>{{ msgpwd }}</p>
            <br />
            <input
              type="password"
              v-model="check_password"
              placeholder="Enter Password"
              class="pwd-input w-full"
            /><br />
            <span class="pwd_label"></span>
            <div class="flex justify-center">
              <button
                class="btn mt-6 mr-2"
                style="background: #1774ff; color: #fff"
                type="submit"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <div
        v-else-if="
          board.public === true &&
          ['Anyone can sign in', 'Users created by admin'].includes(
            board.sign_in_method
          ) &&
          check_board_path != board.path
        "
        class="max-w-lg mx-auto items-center pt-10 md:pt-44"
      >
        <div
          :style="'padding: 25px; background:rgb(190,221,255); border-radius:1.25rem;'"
          class="border rounded-md"
        >
          <h3 class="text-2xl text-center p-5">Login to {{ board.name }}</h3>

          <form
            v-if="otp_sent"
            accept-charset="UTF-8"
            v-on:submit.prevent="verify_n_generate_session"
            method="POST"
          >
            <p>{{ msgpwd }}</p>
            <br />
            <input
              v-model="login_email"
              placeholder="Enter email"
              readonly
              type="email"
              class="pwd-input w-full"
            /><br />
            <input
              type="password"
              maxlength="6"
              placeholder="Enter PIN"
              v-model="otp"
              class="pwd-input w-full mt-3"
            />
            <span class="pwd_label"></span>
            <div class="flex justify-center">
              <button
                class="btn mt-6 mr-2"
                style="background: #1774ff; color: #fff"
                type="submit"
              >
                Submit
              </button>
              <a
                @click.prevent="refershPage"
                href="#"
                style="background: #1774ff; color: #fff"
                class="btn mt-6 mr-2"
                >Try another email</a
              >
            </div>
          </form>
          <form
            v-else
            accept-charset="UTF-8"
            v-on:submit.prevent.once="send_otp"
            method="POST"
          >
            <input
              v-model="login_email"
              placeholder="Enter email"
              type="email"
              required
              class="pwd-input w-full"
            /><br />
            <span class="pwd_label"></span>
            <div class="flex justify-center">
              <button
                class="btn mt-6 mr-2"
                style="background: #1774ff; color: #fff"
                type="submit"
              >
                Submit
              </button>
              <a
                @click.prevent="refershPage"
                style="background: #1774ff; color: #fff"
                href="#"
                class="btn mt-6 mr-2"
                >Reset</a
              >
            </div>
          </form>
        </div>
      </div>
      <div
        v-else-if="
          board.public === true &&
          ['Use password set by user'].includes(board.sign_in_method) &&
          check_board_path != board.path
        "
        class="max-w-lg mx-auto items-center pt-10 md:pt-44"
      >
        <div
          :style="'padding: 25px; background:rgb(190,221,255); border-radius:1.25rem;'"
          class="border rounded-md"
        >
          <form
            v-if="password_reset_otp_sent"
            v-on:submit.prevent="reset_user_password"
            method="POST"
          >
            <h3 class="text-2xl text-center p-5">
              Set new password for {{ board.name }}
            </h3>
            <fieldset :disabled="resetting_password">
              <input
                type="email"
                v-model="login_email"
                placeholder="Enter email"
                readonly
                class="pwd-input w-full"
              /><br />
              <input
                type="text"
                maxlength="6"
                placeholder="Enter OTP"
                v-model="reset_otp"
                inputmode="numeric"
                required
                class="pwd-input w-full mt-3"
              />
              <input
                :type="password_field_type_reset_page ? 'password' : 'text'"
                placeholder="Enter new password"
                v-model="enter_password"
                required
                class="pwd-input w-full mt-3"
              />
              <input
                type="text"
                placeholder="Enter new password again"
                v-model="enter_password_2"
                required
                class="pwd-input w-full mt-3"
              />
              <div class="flex justify-center">
                <button
                  class="btn mt-6 mr-2"
                  style="background: #1774ff; color: #fff"
                  type="submit"
                >
                  <spinner v-if="resetting_password" />
                  Submit
                </button>
              </div>
              <div class="flex justify-center">
                <a
                  @click.prevent="
                    () => {
                      password_reset_otp_sent = false;
                      show_reset_password_form = false;
                    }
                  "
                  href="#"
                  class="mt-6 mr-2"
                >
                  Back to login
                </a>
              </div>
            </fieldset>
          </form>
          <form
            v-else-if="show_reset_password_form"
            v-on:submit.prevent="send_password_reset_otp"
            method="POST"
          >
            <h3 class="text-2xl text-center p-5">
              Get one time OTP for {{ board.name }}
            </h3>
            <p>OTP will be sent over provided email address.</p>
            <br />
            <fieldset :disabled="sending_reset_otp">
              <input
                type="email"
                required
                v-model="login_email"
                placeholder="Enter email"
                class="pwd-input w-full"
              /><br />
              <div class="flex justify-center">
                <button
                  class="btn mt-6 mr-2"
                  style="background: #1774ff; color: #fff"
                  type="submit"
                >
                  <spinner v-if="sending_reset_otp" />
                  Submit
                </button>
              </div>
              <div class="flex justify-center">
                <a
                  @click.prevent="
                    () => {
                      password_reset_otp_sent = false;
                      show_reset_password_form = false;
                    }
                  "
                  href="#"
                  class="mt-6 mr-2"
                >
                  Back to login
                </a>
              </div>
            </fieldset>
          </form>
          <form
            v-else
            accept-charset="UTF-8"
            v-on:submit.prevent="login_with_user_password"
            method="POST"
          >
            <fieldset :disabled="authenticating">
              <h3 class="text-2xl text-center p-5">
                Login to {{ board.name }}
              </h3>
              <p>{{ msgpwd }}</p>
              <br />
              <input
                v-model="login_email"
                placeholder="Enter email"
                type="email"
                required
                class="pwd-input w-full"
              /><br />
              <input
                :type="password_field_type ? 'password' : 'text'"
                placeholder="Enter password"
                v-model="password"
                required
                class="pwd-input w-full my-3"
              />
              <input
                type="checkbox"
                placeholder="Enter new password"
                @change="password_field_type = !password_field_type"
              />
              Show password
              <span class="pwd_label"></span>
              <div class="flex justify-center">
                <button
                  class="btn mt-6 mr-2"
                  style="background: #1774ff; color: #fff"
                  type="submit"
                >
                  <spinner v-if="authenticating" />
                  Sign In
                </button>
                <a
                  @click.prevent="signUpPassword"
                  href="#"
                  style="background: #1774ff; color: #fff"
                  class="btn mt-6 mr-2"
                  >New user? Sign Up</a
                >
              </div>
              <div class="flex justify-center">
                <a @click.prevent="resetPassword" href="#" class="mt-6 mr-2"
                  >Forgot Password?
                </a>
              </div>
            </fieldset>
          </form>
        </div>
      </div>

      <div v-else>
        <div>
          <div class="h-full w-full" v-show="!message">
            <transition-group name="slide-up" mode="out-in">
              <div key="add-block" v-if="page === 'add'" id="add-block">
                <transition-group name="slide-up" mode="out-in">
                  <div key="select-block" v-show="!editing_block_id">
                    <selectBlockType></selectBlockType>
                  </div>
                  <div key="block-editor" v-if="editing_block_id">
                    <boardBlockEditor></boardBlockEditor>
                  </div>
                </transition-group>
              </div>

              <div key="embed" v-if="page === 'embed'" class="w-full">
                <boardEmbed></boardEmbed>
              </div>

              <div key="show-blocks" v-else-if="page === 'view'" class="w-full">
                <boardShowBlocks></boardShowBlocks>
              </div>

              <div
                key="board-settings"
                v-else-if="page == 'settings'"
                id="board-settings"
              >
                <div class="">
                  <div class="border-r-1 border-zinc-200 space-y-4 max-w-xl">
                    <div class="px-3 border-b border-zinc-200 my-6">
                      <a
                        :href="spreadsheet_url"
                        target="_blank"
                        class="text-3xl font-bold inline-flex items-center"
                      >
                        {{ board.title }}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>

                    <div class="py-6">
                      <div v-for="s in settings" :key="s.title">
                        <Accordion :activeIndex="active">
                          <AccordionTab :header="s.title">
                            <objForm
                              :obj.sync="board"
                              :config="s.fields"
                            ></objForm>
                          </AccordionTab>
                        </Accordion>
                      </div>
                    </div>

                    <div
                      class="py-0.5"
                      v-if="email == 'chartmat.com@gmail.com'"
                    >
                      <objForm
                        :obj.sync="board"
                        :config="superAdminOnly"
                      ></objForm>
                    </div>

                    <div>
                      <!-- <p class='text-2xl font-bold my-3'>Template Image:</p>
										<div>
											<div class='w-full'>
												<div class='block w-full mb-1'>
													<div class='sm:inline-flex border border-gray-200 rounded overflow-hidden w-full'>
														<div class='bg-gray-50 p-1 text-center border-r border-gray-200 w-full sm:w-60 truncate' style="background-color: #ededed; padding-top: 12px;">Image</div>
														<input type="file" id="template_image"  name="template_image" class="form-control chartmat-file-input text-center w-full sm:w-22" accept="image/png,image/gif,image/jpeg,image/jpg" style="padding:10px; background-color: white;">
													</div>
												</div>
											</div>
										</div>	 -->
                      <!-- <form>
											<div class="row">
												<div class="col-md-12">
													<div class="iq-card-body col-sm-12 col-lg-12" style="margin-top:-31px;">
														<div class="form-group">
															<label for="image" class="txt_white info_label">Image: </label>
															<input type="file" id="template_image"  name="template_image"  class="form-control chartmat-file-input" accept="image/png,image/gif,image/jpeg,image/jpg"/>
															
														</div>
													</div>
												</div>
											</div>
										</form> -->
                    </div>

                    <div>
                      <p class="text-2xl font-bold my-3">Data Sources:</p>
                      <div>
                        <p class="text-sm text-gray-700">
                          Chartmat will automatically generate data sources from
                          each sheet on your spreadsheet. Below customize the
                          range for each sheet. The default is (A1) which is the
                          first row & column. Use B1 for the second row (with
                          pivot tables) or something like C4:D16 if you want a
                          specific range.
                        </p>

                        <button
                          :class="{ loading: loading.metadata }"
                          @click="updateMetadata"
                          class="my-3 rounded p-1 text-center px-5 text-xs uppercase border border-teal-400 font-bold text-teal-500"
                        >
                          Update Sheets
                        </button>
                        <div>
                          <div class="w-full">
                            <div
                              v-for="sheet in board.sheets"
                              :key="sheet.title"
                              class="block w-full mb-1"
                            >
                              <div
                                class="grid grid-cols-1 sm:grid-cols-3 mt-4 w-full"
                              >
                                <div
                                  class="bg-white capitalize text-black h-full inline-flex mt-3 items-start text-sm font-medium"
                                >
                                  {{ sheet.title }}
                                </div>
                                <div
                                  class="sm:col-span-2 p-1 bg-white h-full w-full inline-flex items-center"
                                >
                                  <div class="center overflow-hidden">
                                    <input
                                      class="appearance-none w-full h-full ring-0 focus:outline-none border-b border-transparent bg-neutral-100 rounded-md py-3 px-3"
                                      placeholder="A1"
                                      :value="sheet.range || 'A1'"
                                      @change="
                                        editRange(
                                          sheet.title,
                                          $event.target.value
                                        )
                                      "
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="inline-flex space-x-4">
                      <button class="btn btn-red" @click="deleteBoard">
                        Delete Board
                      </button>
                      <button
                        class="btn btn-indigo"
                        :class="{ loading: loading.save }"
                        @click="saveBoard"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="h-full w-full" v-show="!message">
        <transition-group name="slide-up" mode="out-in">
          <div key="add-block" v-show="page === 'add'" id="add-block">
            <transition-group name="slide-up" mode="out-in">
              <div key="select-block" v-show="!editing_block_id">
                <selectBlockType></selectBlockType>
              </div>
              <div key="block-editor" v-if="editing_block_id">
                <boardBlockEditor></boardBlockEditor>
              </div>
            </transition-group>
          </div>

          <div key="embed" v-show="page === 'embed'" class="w-full">
            <boardEmbed></boardEmbed>
          </div>

          <div key="embed" v-show="page === 'publish'" class="w-full">
            <ClientOnly>
              <boardPublish></boardPublish>
            </ClientOnly>
          </div>

          <div key="show-blocks" v-show="page === 'view'" class="w-full">
            <boardShowBlocks></boardShowBlocks>
          </div>

          <div
            key="board-settings"
            v-show="page == 'settings'"
            id="board-settings"
            class=""
          >
            <div class="grid grid-cols-1 md:grid-cols-3">
              <div class="space-y-4 pb-6 col-span-1 px-4 bg-white border-r">
                <div class="py-6 border-b">
                  <a
                    :href="spreadsheet_url"
                    target="_blank"
                    class="text-3xl font-bold inline-flex items-center"
                  >
                    {{ board.title }}
                    <span class="text-indigo-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </span>
                  </a>
                </div>

                <div class="pb-6 border-b">
                  <!-- <objForm :obj.sync="board" :config="settings"></objForm> -->
                  <Accordion :activeIndex="active">
                    <AccordionTab
                      :header="s.title"
                      v-for="s in settings"
                      :key="s.title"
                    >
                      <objForm :obj.sync="board" :config="s.fields"></objForm>
                      <div
                        v-if="
                          s.title == 'Privacy' &&
                          board.public &&
                          (board.sign_in_method == 'Users created by admin')
                        "
                      >
                      <div class="mt-3 text-black">
                          <p class="truncate cursor-default">Users</p>
                          <p class="text-sm text-gray-700">
                            Users having access to board.
                          </p>
                          <p class="text-sm text-gray-700">
                            Add <b>_id</b> column to each sheet in your
                            spreadsheet to show user based data on board for
                            logged in users. Chartmat will use this column to
                            store unique id of users and it's recommended to not
                            update these values manually.
                          </p>

                          <div class="my-5">
                            <div
                              v-for="(user, user_index) of users"
                              :key="user_index"
                              class="flex py-1 items-center justify-between border-t first:border-t-0 border-gray-100"
                            >
                              <div class="flex gap-3">
                                <p class="font-semibold text-indigo-600">
                                  {{ user.email }}
                                </p>
                                <div class="inline-flex">
                                  <label class="flex items-center mr-4">
                                    <input
                                      type="radio"
                                      value="read"
                                      v-model="user.permission"
                                      @change="
                                        editUsers(
                                          user.email,
                                          $event.target.value,
                                          user.id
                                        )
                                      "
                                    />
                                    <div class="ml-2">View only</div>
                                  </label>
                                  <label class="flex items-center">
                                    <input
                                      type="radio"
                                      value="read-write"
                                      v-model="user.permission"
                                      @change="
                                        editUsers(
                                          user.email,
                                          $event.target.value,
                                          user.id
                                        )
                                      "
                                    />
                                    <div class="ml-2">Editor</div>
                                  </label>
                                </div>
                              </div>
                              <button
                                class="text-red-600 px-3 text-sm rounded bg-red-50 border border-red-400"
                                @click="deleteUsers(user.id, user.permission)"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div
                            class="flex items-center border border-gray-200 rounded"
                          >
                            <input
                              :disabled="updatingUsers"
                              v-model="new_email"
                              type="text"
                              placeholder="Type an email to add a user"
                              autocomplete="off"
                              @keyup.enter="
                                editUsers($event.target.value, 'read')
                              "
                              ref="new_email"
                              class="my-form w-full border-0 rounded-r-none mr-1"
                            />

                            <div v-if="updatingUsers" class="mr-1 animate-spin">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-6 h-6"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                              </svg>
                            </div>

                            <svg
                              v-else
                              @click="editUsers(new_email, 'read')"
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-6 w-6 text-teal-600 stroke-current mx-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div
                        v-if="
                          s.title == 'Privacy' &&
                          board.public &&
                          (board.sign_in_method == 'Anyone can sign in')
                        "
                      >
                        <div class="mt-3 text-black">
                          <p class="truncate cursor-default">Users</p>
                          <p class="text-sm text-gray-700">
                            Users having access to board.
                          </p>
                          <p class="text-sm text-gray-700">
                            Add <b>_id</b> column to each sheet in your
                            spreadsheet to show user based data on board for
                            logged in users. Chartmat will use this column to
                            store unique id of users and it's recommended to not
                            update these values manually.
                          </p>

                          <div class="my-5">
                            <div
                              v-for="(user, user_index) of users"
                              :key="user_index"
                              class="flex py-1 items-center justify-between border-t first:border-t-0 border-gray-100"
                            >
                              <div class="flex gap-3">
                                <p class="font-semibold text-indigo-600">
                                  {{ user.email }}
                                </p>
                                <div class="inline-flex">
                                  <label class="flex items-center mr-4">
                                    <input
                                      type="radio"
                                      value="read"
                                      v-model="user.permission"
                                      @change="
                                        editUsers(
                                          user.email,
                                          $event.target.value,
                                          user.id
                                        )
                                      "
                                    />
                                    <div class="ml-2">View only</div>
                                  </label>
                                  <label class="flex items-center">
                                    <input
                                      type="radio"
                                      value="read-write"
                                      v-model="user.permission"
                                      @change="
                                        editUsers(
                                          user.email,
                                          $event.target.value,
                                          user.id
                                        )
                                      "
                                    />
                                    <div class="ml-2">Editor</div>
                                  </label>
                                </div>
                              </div>
                              <button
                                class="text-red-600 px-3 text-sm rounded bg-red-50 border border-red-400"
                                @click="deleteUsers(user.id, user.permission)"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </AccordionTab>
                    <AccordionTab
                      header="Only super admin"
                      key="super_admin_only"
                      v-if="email == 'chartmat.com@gmail.com'"
                    >
                      <div class="py-0.5">
                        <objForm
                          :obj.sync="board"
                          :config="superAdminOnly"
                        ></objForm>
                      </div>
                    </AccordionTab>
                    <AccordionTab header="Data Sources" key="data_source">
                      <div>
                        <p class="text-sm text-gray-700">
                          Chartmat will automatically generate data sources from
                          each sheet on your spreadsheet. Below customize the
                          range for each sheet. The default is (A1) which is the
                          first row & column. Use B1 for the second row (with
                          pivot tables) or something like C4:D16 if you want a
                          specific range.
                        </p>

                        <button
                          :class="{ loading: loading.metadata }"
                          @click="updateMetadata"
                          class="my-3 rounded p-1 text-center px-5 text-xs uppercase border border-teal-400 font-bold text-teal-500"
                        >
                          Update Sheets
                        </button>
                        <div>
                          <div class="w-full">
                            <div
                              v-for="sheet in board.sheets"
                              :key="sheet.title"
                              class="block w-full mb-1"
                            >
                              <div
                                class="grid grid-cols-1 sm:grid-cols-3 mt-4 w-full"
                              >
                                <div
                                  class="bg-white capitalize text-black h-full inline-flex mt-3 items-start text-sm font-medium"
                                >
                                  {{ sheet.title }}
                                </div>
                                <div
                                  class="sm:col-span-2 p-1 bg-white h-full w-full inline-flex items-center"
                                >
                                  <div class="center overflow-hidden">
                                    <input
                                      class="appearance-none w-full h-full ring-0 focus:outline-none border-b border-transparent bg-neutral-100 rounded-md py-3 px-3"
                                      placeholder="A1"
                                      :value="sheet.range || 'A1'"
                                      @change="
                                        editRange(
                                          sheet.title,
                                          $event.target.value
                                        )
                                      "
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTab>
                  </Accordion>
                </div>

                <div class="inline-flex space-x-4">
                  <button class="btn btn-red" @click="deleteBoard">
                    Delete Board
                  </button>
                  <button
                    class="btn btn-indigo"
                    :class="{ loading: loading.save }"
                    @click="saveBoard"
                  >
                    Save
                  </button>
                </div>
              </div>
              <Preview
                class="col-span-2 space-y-4 pb-6 col-span-2 px-4 bg-white border-r"
                :board="board"
              ></Preview>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import index from "../../pages/dashboard/index.vue";
const slugify = require("slugify");
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";

export default {
  components: { index, Accordion, AccordionTab },
  fetchOnServer: false,
  layout: "board",
  middleware: "auth",
  beforeDestroy() {
    this.$store.commit("board/RESET_STATE");
  },

  head() {
    return {
      title:
        this.board?.name ?? this.board?.title ?? this.board?.id ?? "Loading",
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: this.board?.favicon || "",
          hid: "icon",
        },
        {
          rel: "shortcut icon",
          type: "image/x-icon",
          href: this.board?.favicon || "",
          hid: "shortcut-icon",
        },
        {
          rel: "apple-touch-icon",
          href: this.board?.favicon || "",
          hid: "apple-touch-icon",
        },
      ],

      meta: this.board?.no_index
        ? [{ hid: "robots", name: "robots", content: "noindex" }]
        : [],
    };
  },

  data() {
    return {
      active: 0,
      updatingUsers: false,

      hash: "",
      showEditBlockId: null,
      message: "Loading...",
      new_email: "",
      users: [],
      board: {},
      loading: {
        metadata: false,
        save: false,
      },
      form: {},

      authenticating: false,
      check_password: "",
      check_board_path: undefined,
      password: "",
      login_email: "",
      password_field_type: "password",
      password_field_type_reset_page: "password",
      fresh_signup: false,

      show_reset_password_form: false,
      password_reset_otp_sent: false,
      enter_password: "",
      enter_password_2: "",
      reset_otp: "",
      sending_reset_otp: false,
      resetting_password: false,

      otp_sent: false,
      otp_doc_id: undefined,
      otp: "",

      user_verified: false,
    };
  },

  async mounted() {

    const CHARTMAT_BOARD_BASE_URL = await this.$axios.$get('/api/getENV/CHARTMAT_BOARD_BASE_URL');
    
    if (`${window.location.host}` === CHARTMAT_BOARD_BASE_URL) {
      const url = this.$auth.loggedIn ? "/dashboard" : "/dashboard/auth";
      this.$router.push(url);
      return;
    }
    if (window.location.pathname === "/index") {
      this.$router.push("/");
      return;
    }
    const { embed, section, block_id } = this.$route.query;
    this.board = {};
    this.$store.commit("board/RESET_STATE");
    try {
      const url = window.location.origin + window.location.pathname;
      const cyrb53 = (str, seed = 0) => {
        let h1 = 0xdeadbeef ^ seed,
          h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
          ch = str.charCodeAt(i);
          h1 = Math.imul(h1 ^ ch, 2654435761);
          h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 =
          Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
          Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 =
          Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
          Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
      };
      this.hash = cyrb53(url);
      if (embed) {
        // hash so that cache is different for each board
        // board added to support safari
        this.board = await this.$private_api.$get(
          `/api/board/${this.hash}?board=${window.location.pathname.replace(
            "/",
            ""
          )}`
        );
        console.log(this.board);
        const userData = await this.$private_api.$get(
          `/api/board/${
            this.hash
          }/users?board=${window.location.pathname.replace("/", "")}`
        );
        this.users = userData.users || [];
        if (this.board.expired) {
          this.message = `Sorry you cannot access this board because Owner’s Chartmat subscription has expired. Access will be restored once subscription is renewed.`;
          return;
        }
      } else {
        this.board = await this.$axios.$get(`/api/board/${this.hash}`);
        const userData = await this.$axios.$get(
          `/api/board/${this.hash}/users`
        );
        this.users = userData.users || [];
        if (this.board.expired) {
          this.message = `Sorry you cannot access this board because Owner’s Chartmat subscription has expired. Access will be restored once subscription is renewed.`;
          return;
        }
      }
    } catch (e) {
      console.error(e);
      const error = this.errorMsg(e);
      if (error.startsWith("index is not")) {
        this.$router.push("/admin");
      }
      this.message = `Error: ${error}`;
      return;
    }
    // FOR EMBEDS
    if (embed) {
      this.board.can_edit = false;
      if (section) {
        this.board.sections = section;
        this.board.blocks = this.board.blocks.filter(
          (block) => block.section === section
        );
        this.board.current_section = section;
      } else if (block_id) {
        const block = this.board.blocks.find((block) => block.id === block_id);
        if (block) {
          this.board.sections = block.section;
          this.board.current_section = section;
          this.board.blocks = [block];
        }
      }
    }
    /**get local storage data and check time */
    this.check_board_path = localStorage.getItem("check_path") || "";
    var setupTime = localStorage.getItem("setupTime");
    const auth_type = localStorage.getItem("auth_type");

    // For email based login need to clear session & local storage if
    // permission or email not found in session
    if (auth_type == "email") {
      if (
        !sessionStorage.getItem("_id") ||
        !sessionStorage.getItem("permission")
      ) {
        localStorage.clear();
        sessionStorage.clear();
      }
    }

    var now = new Date().getTime();
    if (now - setupTime > 30 * 60 * 1000) {
      localStorage.clear();
      sessionStorage.clear();
    }

    this.$store.commit("board/UPDATE", this.board);
    this.message = "Loading data...";
    this.fetchData();
    this.message = null;
  },

  methods: {
    refershPage() {
      window.location.reload(true);
    },

    resetPassword() {
      this.show_reset_password_form = true;
      this.fresh_signup = false;
    },

    signUpPassword() {
      this.show_reset_password_form = true;
      this.fresh_signup = true;
    },

    async getUsers() {
      const userData = await this.$private_api.$get(
        `/api/board/${this.hash}/users`
      );
      this.users = userData.users || [];
    },

    async editUsers(email = "", permission = "", user_id = "") {
      if (!email.length) {
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert(`The email address: "${email}" is not valid`);
        return;
      }
      this.updatingUsers = true;
      await this.$axios.$post(`/api/board_users`, {
        email,
        permission,
        user_id,
      });
      await this.getUsers();
      this.new_email = "";
      this.updatingUsers = false;
    },

    async deleteUsers(user_id, permission = "") {
      await this.$axios.$post(`/api/board_users`, {
        user_id,
        permission,
        remove: true,
      });
      await this.getUsers();
    },

    editRange(sheet_title, new_range) {
      const sheets = JSON.parse(JSON.stringify(this.board.sheets));
      const index = sheets.findIndex((s) => s.title === sheet_title);
      sheets[index].range = new_range.toUpperCase();
      this.board.sheets = sheets;
      this.delete_data();
    },

    delete_data() {
      this.$store.commit("board/UPDATE", { sheets_data: {} });
    },

    async upload_file() {
      const file_inputs = document.querySelectorAll(".chartmat-file-input");
      const files = {};
      if (file_inputs.length) {
        for (const file of file_inputs) {
          const formData = new FormData();
          formData.append(file.name, file.files[0]);
          const url = await this.$axios.$post("/api/upload-file", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          files[file.name] = url;
        }
      }
      return files;
    },

    async saveBoard() {
      this.loading.save = true;

      // Upload file
      const uploadResponse = await this.upload_file();

      // Update logo field if logo is uploaded.
      if (uploadResponse["logo"]) {
        this.board.logo = uploadResponse["logo"];
      }

      // Update hero_image field if hero_image is uploaded.
      if (uploadResponse["hero_image"]) {
        this.board.hero_image = uploadResponse["hero_image"];
      }

      // Update template_image if template_image is uploaded.
      if (uploadResponse["template_image"]) {
        this.board.template_image = uploadResponse["template_image"];
      }

      this.board.path = slugify(this.board.path, {
        lower: true,
        strict: true,
        locale: "en",
        trim: true,
      });
      let pwdLength = this.board.password;
      if (pwdLength != undefined) {
        if (pwdLength.length == 32) {
          this.board.password = this.board.password;
        } else {
          var md5 = require("md5");
          this.board.password = md5(this.board.password);
        }
      } else {
        this.board.password = this.board.password;
      }
      await this.$axios.put(`/api/board`, this.board);
      this.loading.save = false;
      alert("Settings Saved");
      window.location.href = this.board.path;
    },

    async deleteBoard() {
      if (confirm("Are you sure you want to delete this board?")) {
        await this.$axios.$delete(`/api/board`);
        this.$router.push("/admin");
      }
    },

    async fetchData() {
      let sheet_titles = this.blocks.map((block) => block.sheet_title);
      // datasource fields have additional dependecies to fetch
      this.blocks.forEach((block) => {
        block.axis.forEach((axis) => {
          Object.keys(axis).forEach((ax) => {
            if (ax.includes("_sheet")) {
              sheet_titles.push(axis[ax]);
            }
          });
        });
      });

      await this.$store.dispatch("board/update_data", {
        sheet_titles: sheet_titles,
      });
    },

    async updateMetadata() {
      if (!this.loading.metadata) {
        this.loading.metadata = true;
        await this.$store.dispatch("board/update_metadata");
        this.board.title = this.$store.state.board.title;
        this.board.sheets = this.$store.state.board.sheets;
        this.delete_data();
        this.loading.metadata = false;
      }
    },

    async login_with_user_password() {
      if (!this.login_email) {
        alert("Email address is required.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(this.login_email)) {
        alert(`The email address: "${this.login_email}" is not valid`);
        return;
      }
      this.authenticating = true;
      try {
        const r = await this.$private_api.$post(
          `/api/board/login-email/${this.board.id}`,
          {
            email: this.login_email,
            workspace_id: this.workspace_id,
            password: this.password,
          }
        );
        if (r.success) {
          localStorage.setItem("check_path", this.board.path);
          var now = new Date().getTime();
          localStorage.setItem("setupTime", now);
          // Add user email and permission in session storage
          localStorage.setItem("auth_type", "email");
          sessionStorage.setItem("_id", r.data.id);
          sessionStorage.setItem("email", r.data.email);
          sessionStorage.setItem("permission", r.data.permission);
          window.location.reload(true);
          this.message = null;
        } else {
          alert(r.msg);
        }
      } catch (e) {
        alert("Something went wrong, Please try again.");
      }
      this.authenticating = false;
      return;
    },

    async send_password_reset_otp() {
      if (!this.login_email) {
        alert("Email address is required.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(this.login_email)) {
        alert(`The email address: "${this.login_email}" is not valid`);
        return;
      }
      this.sending_reset_otp = true;
      try {
        const r = await this.$private_api.$post(
          `/api/board/password-reset-otp/${this.board.id}?fresh_signup=${this.fresh_signup}`,
          {
            email: this.login_email,
            workspace_id: this.workspace_id,
          }
        );
        if (r.success) {
          this.otp_doc_id = r.otp_doc_id;
          this.password_reset_otp_sent = true;
        } else {
          alert(r.msg);
          window.location.reload(true);
        }
      } catch (e) {
        alert("PIN could not be sent, Please try again.");
      }
      this.sending_reset_otp = false;
      return;
    },

    async reset_user_password() {
      if (this.enter_password != this.enter_password_2) {
        alert("Password and confirm password not matching.");
        return;
      }
      this.resetting_password = true;
      try {
        const r = await this.$private_api.$post(
          `/api/board/reset-password/${this.board.id}`,
          {
            email: this.login_email,
            otp_doc_id: this.otp_doc_id,
            otp: this.reset_otp,
            password: this.enter_password,
          }
        );
        if (r.success) {
          alert("Password set successfully.");
          window.location.reload(true);
        } else {
          alert(r.msg);
        }
      } catch (e) {
        alert("Invalid PIN, Please try again.");
      }
      this.resetting_password = false;
    },

    async send_otp() {
      if (!this.login_email) {
        alert("Email address is required.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(this.login_email)) {
        alert(`The email address: "${this.login_email}" is not valid`);
        return;
      }
      try {
        const r = await this.$private_api.$post(
          `/api/board/login/${this.board.id}`,
          {
            email: this.login_email,
            workspace_id: this.workspace_id,
          }
        );
        if (r.success) {
          this.otp_doc_id = r.otp_doc_id;
          this.otp_sent = true;
        } else {
          alert(r.msg);
          window.location.reload(true);
        }
      } catch (e) {
        alert("PIN could not be sent, Please try again.");
      }
      return;
    },

    async checkPassword() {
      var md5 = require("md5");
      const currentpwd = md5(this.check_password);

      if (currentpwd == this.board.password) {
        localStorage.setItem("check_path", this.board.path);
        var now = new Date().getTime();
        localStorage.setItem("setupTime", now);

        window.location.reload();

        this.message = null;
      } else {
        alert("Password is incorrect. Please try again.");
      }
    },

    async verify_n_generate_session() {
      try {
        const r = await this.$private_api.$post(
          `/api/board/auth/${this.board.id}`,
          {
            email: this.login_email,
            otp_doc_id: this.otp_doc_id,
            otp: this.otp,
          }
        );
        if (r.success) {
          localStorage.setItem("check_path", this.board.path);
          var now = new Date().getTime();
          localStorage.setItem("setupTime", now);
          // Add user email and permission in session storage
          localStorage.setItem("auth_type", "email");
          sessionStorage.setItem("_id", r.data.id);
          sessionStorage.setItem("email", r.data.email);
          sessionStorage.setItem("permission", r.data.permission);
          window.location.reload(true);
          this.message = null;
        } else {
          alert(r.msg);
        }
      } catch (e) {
        alert("Invalid PIN, Please try again.");
      }
    },
  },
  computed: {
    msgpwd() {
      switch (this.board.sign_in_method) {
        case "Use password set by user":
          return "This board is password protected. Please enter email and password to access it.";

        case "Use password set by admin":
          return "This board is password protected. Please enter password to access it.";

        default:
          return "Enter secure PIN sent to your email";
      }
    },
    ...mapState("board", [
      "tempo_block",
      "title",
      "blocks",
      "page",
      "board_background",
      "can_edit",
      "id",
      "workspace_id",
      "hero_background",
      "board_background",
      "block_border",
      "block_shadow",
    ]),
    email() {
      return this.$auth?.user?.email;
    },
    ...mapGetters("board", ["section_blocks", "spreadsheet_url"]),
    board_sheet_titles() {
      const sheets = this.board.sheets || [];
      return sheets.map((s) => s.title);
    },
    superAdminOnly() {
      return {
        template_image: {
          type: "image",
          description:
            "Upload/ Update screenshot of template which will be displayed on websites's featured templates section.",
          file_mime_type: "image/*",
        },
        cover_color: { type: "color", default_value: "#161819" },
        featured: {
          description:
            "Enable this option to display template on websites's featured section.",
          type: "boolean",
          default_value: false,
        },
      };
    },
    settings() {
      const all = [
        {
          title: "Name & Logo",
          fields: {
            name: {
              placeholder: "Type a name here",
              description:
                "This is the board name. If you leave it empty we will use the name of the spreadsheet. It will show in the list of your boards.",
            },
            path: {
              description:
                "This is the path you use to access this board. Use 'index' to show it in the homepage of your workspace domain",
            },
            hero: {
              placeholder: "## Give me a title!",
              description:
                "This is the hero section which shows above each block. You can use markdown and HTML to add images and links. We have a good article in the support docs if you need help with this.",
              type: "textarea",
              default_value: `## ${this.title}`,
            },
            hero_image: {
              type: "image",
              description:
                "Upload/Update hero image. Recommended image resolution is 1920x130px. File size should not exceed 500KB.",
              file_mime_type: "image/*",
              remove_link: true,
            },
            logo: {
              type: "image",
              description: "Upload/Update board logo.",
              file_mime_type: "image/*",
              remove_link: true,
              remove_caption: "Remove logo",
            },
          },
        },
        {
          title: "Appearance",
          fields: {
            hero_background: { type: "color", default_value: "#161819" },
            board_background: { type: "color", default_value: "#FAFAFA" },
            block_border: { type: "color", default_value: "#161819" },
            block_shadow: { type: "color", default_value: "#888888;" },
            active_section_background_color: {
              type: "color",
              default_value: "",
            },
            active_section_text_color: { type: "color", default_value: "" },
            inactive_section_text_color: { type: "color", default_value: "" },
          },
        },
        {
          title: "Privacy",
          fields: {
            public: {
              description:
                "If you make this board public anyone with the link will be able to see it",
              type: "boolean",
              default_value: false,
            },
            sign_in_method: {
              description:
                "You can enable authentication for public boards to restrict your board access",
              type: "select",
              default_value: "Password protection",
              options: [
                "No sign in",
                "Anyone can sign in",
                "Use password set by user",
                "Use password set by admin",
                "Users created by admin",
              ],
              hide: [["public", "!==", true]],
            },
            password: {
              placeholder: "Type a Password here",
              hide: [["sign_in_method", "!==", "Use password set by admin"]],
              description:
                "Set password for public board to restrict access. If password is already set, this field would display the encrypted value. To reset new password overwrite new value with the encrypted string displayed in this field.",
            },
          },
        },
        {
          title: "Other Settings",
          fields: {
            sections: {
              placeholder: "users, reports",
              description:
                "Organize your blocks in groups (tabs). If you leave this empty all blocks will show and section tabs will be hidden",
            },
            hide_search: {
              type: "boolean",
              description:
                "You can chose whether to hide the top global search bar from your board",
              default: true,
            },
            no_index: {
              type: "boolean",
              default_value: true,
              description:
                "Select whether you want to allow Google and other search engines to index this page (noindex meta tag). Set TRUE to hide from search engines.",
            },
          },
        },
      ];
      return all;
    },
    editing_block_id() {
      return this.tempo_block?.id;
    },
  },
};
</script>

<style>
</style>