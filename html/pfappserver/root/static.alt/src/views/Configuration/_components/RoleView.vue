<template>
  <pf-config-view
    :isLoading="isLoading"
    :form="getForm"
    :model="role"
    :vuelidate="$v.role"
    :isNew="isNew"
    :isClone="isClone"
    @validations="roleValidations = $event"
    @close="close"
    @create="create"
    @save="save"
    @remove="remove"
  >
    <template slot="header" is="b-card-header">
      <b-button-close @click="close" v-b-tooltip.hover.left.d300 :title="$t('Close [ESC]')"><icon name="times"></icon></b-button-close>
      <h4 class="mb-0">
        <span v-if="!isNew && !isClone">{{ $t('Role {id}', { id: id }) }}</span>
        <span v-else-if="isClone">{{ $t('Clone Role {id}', { id: id }) }}</span>
        <span v-else>{{ $t('New Role') }}</span>
      </h4>
    </template>
    <template slot="footer"
      scope="{isDeletable}"
    >
      <b-card-footer @mouseenter="$v.role.$touch()">
        <pf-button-save :disabled="invalidForm" :isLoading="isLoading">
          <template v-if="isNew">{{ $t('Create') }}</template>
          <template v-else-if="isClone">{{ $t('Clone') }}</template>
          <template v-else-if="ctrlKey">{{ $t('Save &amp; Close') }}</template>
          <template v-else>{{ $t('Save') }}</template>
        </pf-button-save>
        <pf-button-delete v-if="isDeletable" class="ml-1" :disabled="isLoading" :confirm="$t('Delete Role?')" @on-delete="remove()"/>
      </b-card-footer>
    </template>
  </pf-config-view>
</template>

<script>
import pfConfigView from '@/components/pfConfigView'
import pfButtonSave from '@/components/pfButtonSave'
import pfButtonDelete from '@/components/pfButtonDelete'
import pfMixinCtrlKey from '@/components/pfMixinCtrlKey'
import pfMixinEscapeKey from '@/components/pfMixinEscapeKey'
import {
  pfConfigurationRoleViewFields as fields,
  pfConfigurationRoleViewDefaults as defaults
} from '@/globals/configuration/pfConfigurationRoles'
const { validationMixin } = require('vuelidate')

export default {
  name: 'RoleView',
  mixins: [
    validationMixin,
    pfMixinCtrlKey,
    pfMixinEscapeKey
  ],
  components: {
    pfConfigView,
    pfButtonSave,
    pfButtonDelete
  },
  props: {
    storeName: { // from router
      type: String,
      default: null,
      required: true
    },
    isNew: { // from router
      type: Boolean,
      default: false
    },
    isClone: { // from router
      type: Boolean,
      default: false
    },
    id: { // from router
      type: String,
      default: null
    }
  },
  data () {
    return {
      role: defaults(this), // will be overloaded with the data from the store
      roleValidations: {} // will be overloaded with data from the pfConfigView
    }
  },
  validations () {
    return {
      role: this.roleValidations
    }
  },
  computed: {
    isLoading () {
      return this.$store.getters['$_roles/isLoading']
    },
    invalidForm () {
      return this.$v.role.$invalid || this.$store.getters['$_roles/isWaiting']
    },
    getForm () {
      return {
        labelCols: 3,
        fields: fields(this)
      }
    },
    isDeletable () {
      if (this.isNew || this.isClone || ('not_deletable' in this.role && this.role.not_deletable)) {
        return false
      }
      return true
    }
  },
  methods: {
    close () {
      this.$router.push({ name: 'roles' })
    },
    create () {
      const ctrlKey = this.ctrlKey
      this.$store.dispatch('$_roles/createRole', this.role).then(response => {
        if (ctrlKey) { // [CTRL] key pressed
          this.close()
        } else {
          this.$router.push({ name: 'role', params: { id: this.role.id } })
        }
      })
    },
    save () {
      const ctrlKey = this.ctrlKey
      this.$store.dispatch('$_roles/updateRole', this.role).then(response => {
        if (ctrlKey) { // [CTRL] key pressed
          this.close()
        }
      })
    },
    remove () {
      this.$store.dispatch('$_roles/deleteRole', this.id).then(response => {
        this.close()
      })
    }
  },
  created () {
    if (this.id) {
      this.$store.dispatch('$_roles/getRole', this.id).then(data => {
        this.role = Object.assign({}, data)
      })
    }
  }
}
</script>
