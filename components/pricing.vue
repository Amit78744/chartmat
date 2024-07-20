<template>
  <section
    style="background: url('/backgrounds/home-bg.png'); background-size: cover"
    class="mx-auto"
  >
    <Dialog
      header="Terms and Conditions"
      :visible.sync="showTerms"
      :modal="true"
      :closeOnEscape="true"
    >
      <ul style="list-style: number" class="px-5">
        <li class="mt-5">Lifetime access to Chartmat</li>
        <li class="mt-5">All future Pro Plan updates</li>
        <li class="mt-5">
          No upgrade or downgrade once plan is purchased, just choose the plan
          that's right for you
        </li>
        <li class="mt-5">GDPR compliant</li>
        <li class="mt-5">60-day money-back guarantee, no matter the reason</li>
      </ul>
    </Dialog>

    <div v-if="showtext" class="max-w-3xl mx-auto">
      <div class="text-center py-10" v-if="selectedDuration == 'lifetime'">
        <p class="text-3xl font-bold">
          Unlock unlimited potential with our lifetime deal - one payment,
          endless possibilities!
        </p>
        <p class="text-slate-600">
          Join our 300+ existing lifetime users and create unlimited apps with
          all new features included.
        </p>
      </div>
      <div class="text-center py-10" v-else>
        <p class="text-3xl font-bold">Start a 14 days free trial</p>
        <p class="text-slate-600">
          We'll ask for your credit card but you won't be charged during your
          free trial and can cancel at any time. <br />
          After your free trial a 30 day refund guarantee applies.
        </p>
      </div>

      <div class="w-full mx-auto px-6 sm:px-10"></div>
    </div>

    <div class="container mx-auto">
      <div class="mt-10 mb-10 md:mb-10">
        <div class="flex items-center justify-center">
          <div
            class="flex border max-w-fit items-center"
            style="border-radius: 40px"
          >
            <div v-for="p in planDurations" :key="p">
              <div
                class="px-4 py-2 capitalize cursor-pointer font-medium"
                style="border-radius: 40px"
                :class="{ 'bg-grad text-white': p == selectedDuration }"
                @click.prevent="selectedDuration = p"
              >
                {{ p }}
              </div>
            </div>
          </div>
        </div>
        <div class="text-sm text-gray-400 px-5 w-full text-center mt-2">
          (Save up to <span style="color: #4f46e5">25%</span> on Yearly plan)
        </div>
      </div>

      <div
        class="mx-auto relative overflow-x-auto py-8 container"
        v-if="selectedDuration == 'monthly'"
      >
        <div class="text-center mb-8" v-show="!$auth.loggedIn">
          <label class="mr-2 text-lg">Your email</label><br />
          <input
            v-model="email"
            class="p-2 border border-gray-200 rounded-lg w-5/6 md:w-1/3"
            placeholder="you@company.com"
          />
        </div>

        <div style="width: 100%; min-width: 786px">
          <div class="grid grid-cols-4 gap-0.5 auto-cols-max flex-nowrap">
            <div class="px-2 text-3xl py-8 font-bold"><h1>Features</h1></div>

            <!-- lite -->
            <div class="text-center py-8">
              <div
                class="bg-gray-100 rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #808080"
              >
                Lite
              </div>
              <div class="py-4">
                <div class="py-2">
                  <span class="text-xl font-bold"
                    >$19
                    <span class="text-sm font-normal" style="color: grey"
                      >/ mo</span
                    ></span
                  >
                </div>
                <div class="text-sm">Billed monthly</div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('lite_monthly')"
                />
              </div>
            </div>

            <!-- Pro  -->
            <div
              class="text-center py-8 relative rounded-tr rounded-tl"
              style="background: #f9f9ff;border-left: 1px solid #dcdafa;border-right: 1px solid #dcdafa;border-top: 1px solid #dcdafa;
              "
            >
              <div class="absolute w-full top-0">
                <div
                  style="background: #ffbb00;border-radius: 22px;margin-top: -15px;"
                  class="mx-auto px-2 py-1 text-sm w-fit -mt-5 font-bold"
                >
                  Popular
                </div>
              </div>
              <div
                class="rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #4f46e5; background: #eeeeff"
              >
                Pro
              </div>
              <div class="py-4">
                <div class="py-2">
                  <span class="text-xl font-bold"
                    >$29
                    <span class="text-sm font-normal" style="color: grey"
                      >/ mo</span
                    ></span
                  >
                </div>
                <div class="text-sm">Billed monthly</div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('pro_monthly')"
                />
              </div>
            </div>

            <!-- Enterprise -->
            <div class="text-center py-8">
              <div
                class="rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #10ac84; background: #e7fbf5"
              >
                Business
              </div>
              <div class="py-4">
                <div class="py-2">
                  <span class="text-xl font-bold"
                    >$99
                    <span class="text-sm font-normal" style="color: grey"
                      >/ mo</span
                    ></span
                  >
                </div>
                <div class="text-sm">Billed monthly</div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('business_monthly')"
                />
              </div>
            </div>
          </div>
          <div v-for="(s, i) in regular_plan" :key="s.title">
            <hr />
            <div
              class="px-2 lifetime-deal-section-title uppercase grid grid-cols-4 gap-0.5 auto-cols-max flex-nowrap"
            >
              <div class="Uppercase py-6">{{ s.title }}</div>
              <div class="col-span-1"></div>
              <div
                class="py-6"
                style="background: #f9f9ff;width: 101%;border-left: 1px solid #dcdafa;border-right: 1px solid #dcdafa;"
              ></div>
            </div>
            <div
              v-for="(r, i) in s.values"
              :key="r"
              class="grid grid-cols-4 gap-0.5 auto-cols-max flex-nowrap relative"
            >
              <div
                v-for="(v, j) in r"
                :key="j"
                class="capitalize py- justify-center py-4 px-2"
                :class="{
                  'font-bold lifetime-deal-feature': j == 0,
                  'text-center mx-auto ': j > 0,
                  'rounded-br rounded-bl pb-10': i == 12,
                }"
                style="width: 100%"
                :style="[
                  j == 2
                    ? {
                        background: '#F9F9FF',
                        'border-left': '1px solid #DCDAFA',
                        'border-right': '1px solid #DCDAFA',
                        'border-bottom': i == 12 ? '1px solid #dcdafa' : '',
                      }
                    : '',
                ]"
              >
                <div>
                  <div v-html="v"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-4 gap-0.5 auto-cols-max flex-nowrap">
            <div class="px-2 text-3xl py-8 font-bold"></div>

            <!-- lite -->
            <div class="text-center py-8">
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('lite_monthly')"
              />
            </div>

            <!-- Pro  -->
            <div
              class="text-center py-8 relative rounded-tr rounded-tl"
              style="background: #f9f9ff;border-left: 1px solid #dcdafa;border-right: 1px solid #dcdafa;border-bottom: 1px solid #dcdafa;
              "
            >
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('pro_monthly')"
              />
            </div>

            <!-- Enterprise -->
            <div class="text-center py-8">
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('business_monthly')"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        class="mx-auto relative overflow-x-auto py-8 container"
        v-else-if="selectedDuration == 'yearly'"
      >
        <div class="text-center mb-8" v-show="!$auth.loggedIn">
          <label class="mr-2 text-lg">Your email</label><br />
          <input
            v-model="email"
            class="p-2 border border-gray-200 rounded-lg w-5/6 md:w-1/3"
            placeholder="you@company.com"
          />
        </div>
        <div style="width: 100%; min-width: 786px">
          <div class="grid grid-cols-4 gap-0.5 auto-cols-max flex-nowrap">
            <div class="px-2 text-3xl py-8 font-bold"><h1>Features</h1></div>

            <!-- lite -->
            <div class="text-center py-8">
              <div
                class="bg-gray-100 rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #808080"
              >
                Lite
              </div>
              <div class="py-4">
                <div class="py-2">
                  <span class="text-xl font-bold"
                    >$14
                    <span class="text-sm font-normal" style="color: grey"
                      >/ mo</span
                    ></span
                  >
                </div>
                <div class="text-sm">Billed yearly</div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('lite_yearly')"
                />
              </div>
            </div>

            <!-- Pro  -->
            <div
              class="text-center py-8 relative rounded-tr rounded-tl"
              style="
                background: #f9f9ff;
                border-left: 1px solid #dcdafa;
                border-right: 1px solid #dcdafa;
                border-top: 1px solid #dcdafa;
              "
            >
              <div class="absolute w-full top-0">
                <div
                  style="background: #ffbb00;border-radius: 22px;margin-top: -15px;
                  "
                  class="mx-auto px-2 py-1 text-sm w-fit -mt-5 font-bold"
                >
                  Popular
                </div>
              </div>
              <div
                class="rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #4f46e5; background: #eeeeff"
              >
                Pro
              </div>
              <div class="py-4">
                <div class="py-2">
                  <span class="text-xl font-bold"
                    >$22
                    <span class="text-sm font-normal" style="color: grey"
                      >/ mo</span
                    ></span
                  >
                </div>
                <div class="text-sm">Billed yearly</div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('pro_yearly')"
                />
              </div>
            </div>

            <!-- Enterprise -->
            <div class="text-center py-8">
              <div
                class="rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #10ac84; background: #e7fbf5"
              >
                Business
              </div>
              <div class="py-4">
                <div class="py-2">
                  <span class="text-xl font-bold"
                    >$62
                    <span class="text-sm font-normal" style="color: grey"
                      >/ mo</span
                    ></span
                  >
                </div>
                <div class="text-sm">Billed yearly</div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('business_yearly')"
                />
              </div>
            </div>
          </div>
          <div v-for="(s, i) in regular_plan" :key="s.title">
            <hr />
            <div
              class="px-2 lifetime-deal-section-title uppercase grid grid-cols-4 gap-0.5 auto-cols-max flex-nowrap"
            >
              <div class="Uppercase py-6">{{ s.title }}</div>
              <div class="col-span-1"></div>
              <div
                class="py-6"
                style="background: #f9f9ff;width: 101%;border-left: 1px solid #dcdafa;border-right: 1px solid #dcdafa;
                "
              ></div>
            </div>
            <div
              v-for="(r, i) in s.values"
              :key="r"
              class="grid grid-cols-4 gap-0.5 auto-cols-max flex-nowrap relative"
            >
              <div
                v-for="(v, j) in r"
                :key="j"
                class="capitalize py- justify-center py-4 px-2"
                :class="{
                  'font-bold lifetime-deal-feature': j == 0,
                  'text-center mx-auto ': j > 0,
                  'rounded-br rounded-bl pb-10': i == 12,
                }"
                style="width: 100%"
                :style="[
                  j == 2
                    ? {
                        background: '#F9F9FF',
                        'border-left': '1px solid #DCDAFA',
                        'border-right': '1px solid #DCDAFA',
                        'border-bottom': i == 12 ? '1px solid #dcdafa' : '',
                      }
                    : '',
                ]"
              >
                <div>
                  <div v-html="v"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-4 gap-0.5 auto-cols-max flex-nowrap">
            <div class="px-2 text-3xl py-8 font-bold"></div>

            <!-- lite -->
            <div class="text-center py-8">
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('lite_yearly')"
              />
            </div>

            <!-- Pro  -->
            <div
              class="text-center py-8 relative rounded-tr rounded-tl"
              style="
                background: #f9f9ff;
                border-left: 1px solid #dcdafa;
                border-right: 1px solid #dcdafa;
                border-bottom: 1px solid #dcdafa;
              "
            >
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('pro_yearly')"
              />
            </div>

            <!-- Enterprise -->
            <div class="text-center py-8">
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('business_yearly')"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="mx-auto relative overflow-x-auto py-2">
        <div class="text-center mb-8" v-show="!$auth.loggedIn">
          <label class="mr-2 text-lg">Your email</label><br />
          <input
            v-show="!$auth.loggedIn"
            v-model="email"
            class="p-2 border border-gray-200 rounded-lg w-5/6 md:w-1/3"
            placeholder="you@company.com"
          />
        </div>
        <div style="width: 100%; min-width: 1024px">
          <div class="grid grid-cols-6 gap-0.5 auto-cols-max flex-nowrap">
            <div class="px-2 text-3xl py-8 font-bold"><h1>Features</h1></div>

            <!-- lite -->
            <div class="text-center py-8">
              <div
                class="bg-gray-100 rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #808080"
              >
                Lite
              </div>
              <div class="py-4">
                <div class="text-sm py-2">One-time purchase of</div>
                <div class="">
                  <span class="text-xl font-bold">$79</span> |
                  <span><del class="text-slate-400">$264</del></span>
                </div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('lite_lifetime')"
                />
              </div>
            </div>

            <!-- Pro -->
            <div class="text-center py-8">
              <div
                class="rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #2481ff; background: #eff6ff"
              >
                Pro
              </div>
              <div class="py-4">
                <div class="text-sm py-2">One-time purchase of</div>
                <div class="">
                  <span class="text-xl font-bold">$158</span> |
                  <span><del class="text-slate-400">$528</del></span>
                </div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('pro_lifetime')"
                />
              </div>
            </div>

            <!-- Pro plus -->
            <div
              class="text-center py-8 relative rounded-tr rounded-tl"
              style="
                background: #f9f9ff;
                border-left: 1px solid #dcdafa;
                border-right: 1px solid #dcdafa;
                border-top: 1px solid #dcdafa;
              "
            >
              <div class="absolute w-full top-0">
                <div
                  style="
                    background: #ffbb00;
                    border-radius: 22px;
                    margin-top: -15px;
                  "
                  class="mx-auto px-2 py-1 text-sm w-fit -mt-5 font-bold"
                >
                  Popular
                </div>
              </div>
              <div
                class="rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #4f46e5; background: #eeeeff"
              >
                Pro Plus
              </div>
              <div class="py-4">
                <div class="text-sm py-2">One-time purchase of</div>
                <div class="">
                  <span class="text-xl font-bold">$237</span> |
                  <span><del class="text-slate-400">$792</del></span>
                </div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('proplus_lifetime')"
                />
              </div>
            </div>

            <!-- Pro max -->
            <div class="text-center py-8">
              <div
                class="rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #fc5c65; background: #fff3f3"
              >
                Pro Max
              </div>
              <div class="py-4">
                <div class="text-sm py-2">One-time purchase of</div>
                <div class="">
                  <span class="text-xl font-bold">$316</span> |
                  <span><del class="text-slate-400">$1056</del></span>
                </div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('promax_lifetime')"
                />
              </div>
            </div>

            <!-- Enterprise -->
            <div class="text-center py-8">
              <div
                class="rounded mx-auto text-center px-8 py-1 text-lg w-fit font-bold"
                style="color: #10ac84; background: #e7fbf5"
              >
                Enterprise
              </div>
              <div class="py-4">
                <div class="text-sm py-2">One-time purchase of</div>
                <div class="">
                  <span class="text-xl font-bold">$395</span> |
                  <span><del class="text-slate-400">$1320</del></span>
                </div>
              </div>
              <div class="mt-4">
                <ThemeButton
                  caption=" Get started"
                  class="w-fit"
                  :spinner="loading_plan"
                  @click.native="upgrade('enterprise_lifetime')"
                />
              </div>
            </div>
          </div>
          <div v-for="(s, i) in lifetime_plan" :key="s.title">
            <hr />
            <div
              class="px-2 lifetime-deal-section-title uppercase grid grid-cols-6 gap-0.5 auto-cols-max flex-nowrap"
            >
              <div class="col-span-3 Uppercase py-6 font-bold">
                {{ s.title }}
              </div>
              <div
                class="py-6"
                style="background: #f9f9ff;width: 101%;border-left: 1px solid #dcdafa;border-right: 1px solid #dcdafa;
                "
              ></div>
              <div class="col-span-2"></div>
            </div>
            <div
              v-for="(r, i) in s.values"
              :key="r"
              class="grid grid-cols-6 gap-0.5 auto-cols-max flex-nowrap relative"
            >
              <div
                v-for="(v, j) in r"
                :key="j"
                class="capitalize py- justify-center py-4 px-2"
                :class="{
                  'lifetime-deal-feature font-bold': j == 0,
                  'text-center mx-auto ': j > 0,
                  'rounded-br rounded-bl': i == 12,
                }"
                style="width: 100%"
                :style="[
                  j == 3
                    ? {
                        background: '#F9F9FF',
                        'border-left': '1px solid #DCDAFA',
                        'border-right': '1px solid #DCDAFA',
                        'border-bottom': i == 12 ? '1px solid #dcdafa' : '',
                      }
                    : '',
                ]"
              >
                <div>
                  <div v-html="v"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-6 gap-0.5 auto-cols-max flex-nowrap">
            <div class="px-2 text-3xl py-8"><h1></h1></div>

            <!-- lite -->
            <div class="text-center py-8">
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('lite_lifetime')"
              />
            </div>

            <!-- Pro -->
            <div class="text-center py-8">
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('pro_lifetime')"
              />
            </div>

            <!-- Pro plus -->
            <div
              class="text-center py-8 relative rounded-br rounded-bl"
              style="background: #f9f9ff;border-left: 1px solid #dcdafa;border-right: 1px solid #dcdafa;border-bottom: 1px solid #dcdafa;padding-bottom: 10px;
              "
            >
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('proplus_lifetime')"
              />
            </div>

            <!-- Pro max -->
            <div class="text-center py-8">
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('promax_lifetime')"
              />
            </div>

            <!-- Enterprise -->
            <div class="text-center py-8">
              <ThemeButton
                caption=" Get started"
                class="w-fit"
                :spinner="loading_plan"
                @click.native="upgrade('enterprise_lifetime')"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        class="max-w-2xl mx-auto my-10 px-5 py-5 rounded-md text-center"
        v-if="selectedDuration == 'lifetime'"
        style="background: #f7f7ff"
      >
        If you use any of our Services, you are agreeing to these
        <a
          href="#"
          class="text-indigo"
          @click.prevent="
            () => {
              showTerms = true;
            }
          "
          style="color: #4f46e5"
          >Terms and Conditions.</a
        >
      </div>
    </div>
  </section>
</template>

<script>
const {
  graySvg,
  blueSvg,
  indigoSvg,
  greenSvg,
  purpleSvg,
  getStartedButton,
} = require("../assets/svgs");
import Dialog from "primevue/dialog";

export default {
  layout: "site",

  components: {
    Dialog,
  },

  props: {
    has_plan: {},
    showtext: { default: false },
    showTerms: { default: false },
    startpage: { default: false },
  },
  data() {
    let planDurations = ["monthly", "yearly"];
    if (!this.has_plan || this.has_plan == "" || this.has_plan == "free") {
      // planDurations.push("lifetime");
    }
    return {
      selectedDuration: planDurations[planDurations.length - 1],
      planDurations,
      loading_plan: null,
      plans: [
        {
          name: "Lite",
          code: "lite",
          desc: "For individuals building apps and dashboards.",
          link: "https://chartmat.app/dashboard/start",
          svg: `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M26.9167 2.8335H12.75C11.1874 2.8335 9.91667 4.10425 9.91667 5.66683V14.1668H7.08333C5.52075 14.1668 4.25 15.4376 4.25 17.0002V29.7502C4.25 30.1259 4.39926 30.4862 4.66493 30.7519C4.93061 31.0176 5.29094 31.1668 5.66667 31.1668H28.3333C28.7091 31.1668 29.0694 31.0176 29.3351 30.7519C29.6007 30.4862 29.75 30.1259 29.75 29.7502V5.66683C29.75 4.10425 28.4792 2.8335 26.9167 2.8335ZM7.08333 17.0002H15.5833V28.3335H7.08333V17.0002ZM26.9167 28.3335H18.4167V17.0002C18.4167 15.4376 17.1459 14.1668 15.5833 14.1668H12.75V5.66683H26.9167V28.3335Z" fill="white"/>
<path d="M15.5832 8.5H18.4165V11.3333H15.5832V8.5ZM21.2498 8.5H24.0832V11.3333H21.2498V8.5ZM21.2498 14.2106H24.0832V17H21.2498V14.2106ZM21.2498 19.8333H24.0832V22.6667H21.2498V19.8333ZM9.9165 19.8347H12.7498V22.6681H9.9165V19.8347Z" fill="white"/>
</svg>
`,
          price: { monthly: 19, yearly: 14, lifetime: 99 },
          features: [
            "Unlimited boards (Apps and dashboards)",
            "Unlimited rows",
            "Add up to 1 workspaces",
            "Add up to 2 team members per workspace",
            "Public & private boards",
            "Embed boards & blocks in your site",
            "Custom domain with SSL",
          ],
        },
        {
          name: "Pro",
          code: "pro",
          desc: "For teams building apps and dashboards for many public & private users.",
          link: "https://chartmat.app/dashboard/start",
          svg: `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M26.9167 2.8335H12.75C11.1874 2.8335 9.91667 4.10425 9.91667 5.66683V14.1668H7.08333C5.52075 14.1668 4.25 15.4376 4.25 17.0002V29.7502C4.25 30.1259 4.39926 30.4862 4.66493 30.7519C4.93061 31.0176 5.29094 31.1668 5.66667 31.1668H28.3333C28.7091 31.1668 29.0694 31.0176 29.3351 30.7519C29.6007 30.4862 29.75 30.1259 29.75 29.7502V5.66683C29.75 4.10425 28.4792 2.8335 26.9167 2.8335ZM7.08333 17.0002H15.5833V28.3335H7.08333V17.0002ZM26.9167 28.3335H18.4167V17.0002C18.4167 15.4376 17.1459 14.1668 15.5833 14.1668H12.75V5.66683H26.9167V28.3335Z" fill="white"/>
<path d="M15.5832 8.5H18.4165V11.3333H15.5832V8.5ZM21.2498 8.5H24.0832V11.3333H21.2498V8.5ZM21.2498 14.2106H24.0832V17H21.2498V14.2106ZM21.2498 19.8333H24.0832V22.6667H21.2498V19.8333ZM9.9165 19.8347H12.7498V22.6681H9.9165V19.8347Z" fill="white"/>
</svg>
`,
          price: { monthly: 29, yearly: 22, lifetime: 199 },
          most_popular: true,
          features: [
            "Unlimited boards (Apps and dashboards)",
            "Unlimited rows",
            "Add up to 5 workspaces",
            "Add up to 5 team members per workspace",
            "Public & private boards",
            "Embed boards & blocks in your site",
            "Custom domain with SSL",
          ],
        },
        {
          name: "Business",
          code: "business",
          desc: "For businesses building many apps and dashboards for employees & customers.",
          link: "https://chartmat.app/dashboard/start",
          svg: `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M26.9167 2.8335H12.75C11.1874 2.8335 9.91667 4.10425 9.91667 5.66683V14.1668H7.08333C5.52075 14.1668 4.25 15.4376 4.25 17.0002V29.7502C4.25 30.1259 4.39926 30.4862 4.66493 30.7519C4.93061 31.0176 5.29094 31.1668 5.66667 31.1668H28.3333C28.7091 31.1668 29.0694 31.0176 29.3351 30.7519C29.6007 30.4862 29.75 30.1259 29.75 29.7502V5.66683C29.75 4.10425 28.4792 2.8335 26.9167 2.8335ZM7.08333 17.0002H15.5833V28.3335H7.08333V17.0002ZM26.9167 28.3335H18.4167V17.0002C18.4167 15.4376 17.1459 14.1668 15.5833 14.1668H12.75V5.66683H26.9167V28.3335Z" fill="white"/>
<path d="M15.5832 8.5H18.4165V11.3333H15.5832V8.5ZM21.2498 8.5H24.0832V11.3333H21.2498V8.5ZM21.2498 14.2106H24.0832V17H21.2498V14.2106ZM21.2498 19.8333H24.0832V22.6667H21.2498V19.8333ZM9.9165 19.8347H12.7498V22.6681H9.9165V19.8347Z" fill="white"/>
</svg>
`,
          price: { monthly: 99, yearly: 62, lifetime: 499 },
          features: [
            "Unlimited boards (Apps and dashboards)",
            "Unlimited rows",
            "Unlimited Workspaces",
            "Unlimited Team Members",
            "Public & private boards",
            "Embed boards & blocks in your site",
            "Custom domain with SSL",
          ],
        },
      ],
      regular_plan: [
        {
          title: "projects",
          values: [
            ["workspaces", 1, 5, "unlimited"],
            ["workspace editiors", 2, 5, "unlimited"],
            ["boards (web apps)", "unlimited", "unlimited", "unlimited"],
          ],
        },
        {
          title: "users",
          values: [
            ["sign up (web apps)", "unlimited", "unlimited", "unlimited"],
            // ["private", 5, 15, "unlimited", "unlimited", "unlimited"],
            ["public", "unlimited", "unlimited", "unlimited"],
          ],
        },
        {
          title: "data",
          values: [
            ["rows", "unlimited", "unlimited", "unlimited"],
            ["updates", "unlimited", "unlimited", "unlimited"],
            ["image upload", "5 GB", "10 GB", "unlimited"],
          ],
        },
        {
          title: "resources",
          values: [
            ["community", graySvg, indigoSvg, greenSvg],
            ["support", graySvg, indigoSvg, greenSvg],
          ],
        },
        {
          title: "features",
          values: [
            ["Custom Domain with SSL", graySvg, indigoSvg, purpleSvg],
            ["Web Embeds", graySvg, indigoSvg, purpleSvg],
            ["Iframe Embed", graySvg, indigoSvg, purpleSvg],
            ["8+ Building Blocks", graySvg, indigoSvg, purpleSvg],
            ["7+ Chart Types", graySvg, indigoSvg, purpleSvg],
            ["PDF Export", graySvg, indigoSvg, purpleSvg],
            ["Password Protect Public Board", graySvg, indigoSvg, purpleSvg],
            ["App Script API Integration", graySvg, indigoSvg, purpleSvg],
            ["Actions Buttons", graySvg, indigoSvg, purpleSvg],
            ["Customize Forms", graySvg, indigoSvg, purpleSvg],
            ["Insert Maps", graySvg, indigoSvg, purpleSvg],
            ["GDPR Compliant", graySvg, indigoSvg, purpleSvg],
          ],
        },
      ],
      lifetime_plan: [
        {
          title: "projects",
          values: [
            ["workspaces", 1, 3, 10, 25, 100],
            [
              "workspace editiors",
              5,
              15,
              "unlimited",
              "unlimited",
              "unlimited",
            ],
            [
              "boards (web apps)",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
            ],
          ],
        },
        {
          title: "users",
          values: [
            [
              "sign up (web apps)",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
            ],
            // ["private", 5, 15, "unlimited", "unlimited", "unlimited"],
            [
              "public",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
            ],
          ],
        },
        {
          title: "data",
          values: [
            [
              "rows",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
            ],
            [
              "updates",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
              "unlimited",
            ],
            ["image upload", "5 GB", "10 GB", "100 GB", "500 GB", "unlimited"],
          ],
        },
        {
          title: "resources",
          values: [
            ["community", graySvg, blueSvg, indigoSvg, greenSvg, purpleSvg],
            ["support", graySvg, blueSvg, indigoSvg, greenSvg, purpleSvg],
          ],
        },
        {
          title: "features",
          values: [
            [
              "Custom Domain with SSL",
              graySvg,
              blueSvg,
              indigoSvg,
              greenSvg,
              purpleSvg,
            ],
            ["Web Embeds", graySvg, blueSvg, indigoSvg, greenSvg, purpleSvg],
            ["Iframe Embed", graySvg, blueSvg, indigoSvg, greenSvg, purpleSvg],
            [
              "8+ Building Blocks",
              graySvg,
              blueSvg,
              indigoSvg,
              greenSvg,
              purpleSvg,
            ],
            [
              "7+ Chart Types",
              graySvg,
              blueSvg,
              indigoSvg,
              greenSvg,
              purpleSvg,
            ],
            ["PDF Export", graySvg, blueSvg, indigoSvg, greenSvg, purpleSvg],
            [
              "Password Protect Public Board",
              graySvg,
              blueSvg,
              indigoSvg,
              greenSvg,
              purpleSvg,
            ],
            [
              "App Script API Integration",
              graySvg,
              blueSvg,
              indigoSvg,
              greenSvg,
              purpleSvg,
            ],
            [
              "Actions Buttons",
              graySvg,
              blueSvg,
              indigoSvg,
              greenSvg,
              purpleSvg,
            ],
            [
              "Customize Forms",
              graySvg,
              blueSvg,
              indigoSvg,
              greenSvg,
              purpleSvg,
            ],
            ["Insert Maps", graySvg, blueSvg, indigoSvg, greenSvg, purpleSvg],
            [
              "GDPR Compliant",
              graySvg,
              blueSvg,
              indigoSvg,
              greenSvg,
              purpleSvg,
            ],
          ],
        },
      ],
      email: "",
    };
  },
  methods: {
    async upgrade(plan_name) {
      this.loading_plan = plan_name;
      const email = this.email.toLowerCase() || this.$auth?.user?.email.toLowerCase();
      if (!email) {
        this.loading_plan = null;
        alert("email is required");
        return;
      } else if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9.-]+$/.test(email)) {
        this.loading_plan = null;
        alert("The given email address is not valid");
        return;
      }
      let rewardful_referral = null;
      try {
        rewardful_referral = Rewardful.referral;

        const plan_url = await this.$axios.$patch("/api/billing", {
          plan_name,
          email,
          rewardful_referral,
          startpage:this.startpage,
        });
        this.loading_plan = null;
        window.location.href = plan_url;
      } catch (e) {
        this.loading_plan = null;
      }
    },
  },
};
</script>


<style scoped>
>>> .p-dialog-title {
  margin: 0 auto;
}

.lifetime-deal-section-title {
  font-family: "Graphik";
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 27px;
  color: #808080;
}

.lifetime-deal-feature {
  font-family: "Graphik";
  font-style: normal;
  font-size: 18px;
  line-height: 27px;
  color: #000000;
}

@media only screen and (min-width: 786px) {
  .line-height {
    line-height: 4.9rem;
  }
}

.border-grad {
  background: linear-gradient(90.04deg, #4f46e5 -5.12%, #00f1f5 116.3%);
}

.bg-grad,
.get-started-btn {
  background: linear-gradient(90.04deg, #4f46e5 -5.12%, #00f1f5 116.3%);
  border-radius: 8px;
}
.bg-grad:hover,
.get-started-btn:hover {
  background: linear-gradient(269.94deg, #4f46e5 -2.83%, #00f1f5 114.84%);
  border-radius: 8px;
}
</style>