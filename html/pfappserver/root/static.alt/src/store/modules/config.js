
/**
 * "config" store module
 */
import apiCall from '@/utils/api'

const api = {
  getAdminRoles () {
    return apiCall({ url: 'config/admin_roles', method: 'get' })
  },
  getBillingTiers () {
    return apiCall({ url: 'config/billing_tiers', method: 'get' })
  },
  getConnectionProfiles () {
    return apiCall({ url: 'config/connection_profiles', method: 'get' })
  },
  getDomains () {
    return apiCall({ url: 'config/domains', method: 'get' })
  },
  getFloatingDevices () {
    return apiCall({ url: 'config/floating_devices', method: 'get' })
  },
  getRealms () {
    return apiCall({ url: 'config/realms', method: 'get' })
  },
  getRoles () {
    return apiCall({ url: 'node_categories', method: 'get', params: { limit: 1000 } })
  },
  getScans () {
    return apiCall({ url: 'config/scans', method: 'get' })
  },
  getSources () {
    return apiCall({ url: 'config/sources', method: 'get' })
  },
  getSwitches () {
    return apiCall({ url: 'config/switches', method: 'get' })
  },
  getSwitchGroups () {
    return apiCall({ url: 'config/switch_groups', method: 'get' })
  },
  getTenants () {
    return apiCall({ url: 'tenants', method: 'get' })
  },
  getSecurityEvents () {
    return apiCall({ url: 'config/security_events', method: 'get' })
  }
}

const types = {
  LOADING: 'loading',
  DELETING: 'deleting',
  SUCCESS: 'success',
  ERROR: 'error'
}

const state = { // set intitial states to `false` (not `[]` or `{}`) to avoid infinite loop when response is empty.
  adminRolesStatus: '',
  adminRoles: false,
  billingTiersStatus: '',
  billingTiers: false,
  connectionProfilesStatus: '',
  connectionProfiles: false,
  domainsStatus: '',
  domains: false,
  floatingDevicesStatus: '',
  floatingDevices: false,
  realmsStatus: '',
  realms: false,
  rolesStatus: '',
  roles: false,
  scansStatus: '',
  scans: false,
  sourcesStatus: '',
  sources: false,
  switchesStatus: '',
  switches: false,
  switchGroupsStatus: '',
  switchGroups: false,
  tenantsStatus: '',
  tenants: false,
  security_eventsStatus: '',
  security_events: false
}

const helpers = {
  sortSecurityEvents: (security_events) => {
    let sortedIds = Object.keys(security_events).sort((a, b) => {
      if (a === 'defaults') {
        return a
      } else if (!security_events[a].desc && !security_events[b].desc) {
        return a.localeCompare(b)
      } else if (!security_events[b].desc) {
        return a
      } else if (!security_events[a].desc) {
        return b
      } else {
        return security_events[a].desc.localeCompare(security_events[b].desc)
      }
    })
    let sortedSecurityEvents = []
    for (let id of sortedIds) {
      sortedSecurityEvents.push(security_events[id])
    }
    return sortedSecurityEvents
  },
  groupSwitches: (switches) => {
    let ret = []
    if (switches) {
      let groups = [...new Set(switches.map(sw => sw.group))]
      groups.forEach(function (group, index, groups) {
        ret.push({ group: group, switches: switches.filter(sw => sw.group === group) })
      })
    }
    return ret
  }
}

const getters = {
  isLoadingAdminRoles: state => {
    return state.adminRolesStatus === types.LOADING
  },
  isLoadingBillingTiers: state => {
    return state.billingTiersStatus === types.LOADING
  },
  isLoadingConnectionProfiles: state => {
    return state.connectionProfilesStatus === types.LOADING
  },
  isLoadingDomains: state => {
    return state.domainsStatus === types.LOADING
  },
  isLoadingFloatingDevices: state => {
    return state.floatingDevicesStatus === types.LOADING
  },
  isLoadingRealms: state => {
    return state.realmsStatus === types.LOADING
  },
  isLoadingRoles: state => {
    return state.rolesStatus === types.LOADING
  },
  isLoadingScans: state => {
    return state.scansStatus === types.LOADING
  },
  isLoadingSources: state => {
    return state.sourcesStatus === types.LOADING
  },
  isLoadingSwitches: state => {
    return state.switchesStatus === types.LOADING
  },
  isLoadingSwitchGroups: state => {
    return state.switchGroupsStatus === types.LOADING
  },
  isLoadingTenants: state => {
    return state.tenantsStatus === types.LOADING
  },
  isLoadingSecurityEvents: state => {
    return state.security_eventsStatus === types.LOADING
  },
  adminRolesList: state => {
    if (!state.adminRoles) return []
    return state.adminRoles.map((item) => {
      return { value: item.id, name: item.id }
    })
  },
  realmsList: state => {
    if (!state.realms) return []
    return state.realms.map((item) => {
      return { value: item.id, name: item.id }
    })
  },
  rolesList: state => {
    if (!state.roles) return []
    return state.roles.map((item) => {
      return { value: item.category_id, name: item.name, text: `${item.name} - ${item.notes}` }
    })
  },
  sourcesList: state => {
    if (!state.sources) return []
    return state.sources.map((item) => {
      return { value: item.id, name: item.description }
    })
  },
  switchGroupsList: state => {
    if (!state.switchGroups) return []
    return state.switchGroups.map((item) => {
      return { value: item.id, name: item.description }
    })
  },
  switchesList: state => {
    if (!state.switches) return []
    return state.switches.map((item) => {
      return { value: item.id, name: item.description }
    })
  },
  tenantsList: state => {
    if (!state.tenants) return []
    return state.tenants.map((item) => {
      return { value: item.id, name: item.name }
    })
  },
  security_eventsList: state => {
    return helpers.sortSecurityEvents(state.security_events).filter(security_event => security_event.enabled === 'Y').map((item) => {
      return { value: item.id, text: item.desc }
    })
  },
  sortedSecurityEvents: state => {
    return helpers.sortSecurityEvents(state.security_events)
  },
  groupedSwitches: state => {
    return helpers.groupSwitches(state.switches)
  }
}

const actions = {
  getAdminRoles: ({ state, getters, commit }) => {
    if (getters.isLoadingAdminRoles) {
      return
    }
    if (!state.adminRoles) {
      return api.getAdminRoles().then(response => {
        commit('ADMIN_ROLES_UPDATED', response.data.items)
        return state.adminRoles
      })
    } else {
      return Promise.resolve(state.adminRoles)
    }
  },
  getBillingTiers: ({ state, getters, commit }) => {
    if (getters.isLoadingBillingTiers) {
      return
    }
    if (!state.billingTiers) {
      commit('BILLING_TIERS_REQUEST')
      return api.getBillingTiers().then(response => {
        commit('BILLING_TIERS_UPDATED', response.data.items)
        return state.billingTiers
      })
    } else {
      return Promise.resolve(state.billingTiers)
    }
  },
  getConnectionProfiles: ({ state, getters, commit }) => {
    if (getters.isLoadingConnectionProfiles) {
      return
    }
    if (!state.connectionProfiles) {
      commit('CONNECTION_PROFILES_REQUEST')
      return api.getConnectionProfiles().then(response => {
        commit('CONNECTION_PROFILES_UPDATED', response.data.items)
        return state.connectionProfiles
      })
    } else {
      return Promise.resolve(state.connectionProfiles)
    }
  },
  getDomains: ({ state, getters, commit }) => {
    if (getters.isLoadingDomains) {
      return
    }
    if (!state.domains) {
      commit('DOMAINS_REQUEST')
      return api.getDomains().then(response => {
        commit('DOMAINS_UPDATED', response.data.items)
        return state.domains
      })
    } else {
      return Promise.resolve(state.domains)
    }
  },
  getFloatingDevices: ({ state, getters, commit }) => {
    if (getters.isLoadingFloatingDevices) {
      return
    }
    if (!state.floatingDevices) {
      commit('FLOATING_DEVICES_REQUEST')
      return api.getFloatingDevices().then(response => {
        commit('FLOATING_DEVICES_UPDATED', response.data.items)
        return state.floatingDevices
      })
    } else {
      return Promise.resolve(state.floatingDevices)
    }
  },
  getRealms: ({ state, getters, commit }) => {
    if (getters.isLoadingRealms) {
      return
    }
    if (!state.realms) {
      commit('REALMS_REQUEST')
      return api.getRealms().then(response => {
        commit('REALMS_UPDATED', response.data.items)
        return state.realms
      })
    } else {
      return Promise.resolve(state.realms)
    }
  },
  getRoles: ({ state, getters, commit }) => {
    if (getters.isLoadingRoles) {
      return
    }
    if (!state.roles) {
      commit('ROLES_REQUEST')
      return api.getRoles().then(response => {
        commit('ROLES_UPDATED', response.data.items)
        return state.roles
      })
    } else {
      return Promise.resolve(state.roles)
    }
  },
  getScans: ({ state, getters, commit }) => {
    if (getters.isLoadingScans) {
      return
    }
    if (!state.scans) {
      commit('SCANS_REQUEST')
      return api.getScans().then(response => {
        commit('SCANS_UPDATED', response.data.items)
        return state.scans
      })
    } else {
      return Promise.resolve(state.scans)
    }
  },
  getSources: ({ state, getters, commit }) => {
    if (getters.isLoadingSources) {
      return
    }
    if (!state.sources) {
      commit('SOURCES_REQUEST')
      return api.getSources().then(response => {
        commit('SOURCES_UPDATED', response.data.items)
        return state.sources
      })
    } else {
      return Promise.resolve(state.sources)
    }
  },
  getSwitches: ({ state, getters, commit }) => {
    if (getters.isLoadingSwitches) {
      return
    }
    if (!state.switches) {
      commit('SWICTHES_REQUEST')
      return api.getSwitches().then(response => {
        // group can be undefined
        response.data.items.forEach(function (item, index, items) {
          response.data.items[index] = Object.assign({ group: item.group || 'Default' }, item)
        })
        commit('SWICTHES_UPDATED', response.data.items)
        return state.switches
      })
    } else {
      return Promise.resolve(state.switches)
    }
  },
  getSwitchGroups: ({ state, getters, commit }) => {
    if (getters.isLoadingSwitchGroups) {
      return
    }
    if (!state.switchGroups) {
      commit('SWICTH_GROUPS_REQUEST')
      return api.getSwitchGroups().then(response => {
        commit('SWICTH_GROUPS_UPDATED', response.data.items)
        return state.switchGroups
      })
    } else {
      return Promise.resolve(state.switchGroups)
    }
  },
  getTenants: ({ state, getters, commit }) => {
    if (getters.isLoadingTenants) {
      return
    }
    if (!state.tenants) {
      commit('TENANTS_REQUEST')
      return api.getTenants().then(response => {
        commit('TENANTS_UPDATED', response.data.items)
        return state.tenants
      })
    } else {
      return Promise.resolve(state.tenants)
    }
  },
  getSecurityEvents: ({ commit, getters, state }) => {
    if (getters.isLoadingSecurityEvents) {
      return
    }
    if (!state.security_events) {
      commit('SECURITY_EVENTS_REQUEST')
      return api.getSecurityEvents().then(response => {
        commit('SECURITY_EVENTS_UPDATED', response.data.items)
        return state.security_events
      })
    } else {
      return Promise.resolve(state.security_events)
    }
  }
}

const mutations = {
  ADMIN_ROLES_REQUEST: (state) => {
    state.adminRolesStatus = types.LOADING
  },
  ADMIN_ROLES_UPDATED: (state, adminRoles) => {
    state.adminRoles = adminRoles
    state.adminRolesStatus = types.SUCCESS
  },
  BILLING_TIERS_REQUEST: (state) => {
    state.billingTiersStatus = types.LOADING
  },
  BILLING_TIERS_UPDATED: (state, billingTiers) => {
    state.billingTiers = billingTiers
    state.billingTiersStatus = types.SUCCESS
  },
  CONNECTION_PROFILES_REQUEST: (state) => {
    state.connectionProfilesStatus = types.LOADING
  },
  CONNECTION_PROFILES_UPDATED: (state, connectionProfiles) => {
    state.connectionProfiles = connectionProfiles
    state.connectionProfilesStatus = types.SUCCESS
  },
  DOMAINS_REQUEST: (state) => {
    state.domainsStatus = types.LOADING
  },
  DOMAINS_UPDATED: (state, domains) => {
    state.domains = domains
    state.domainsStatus = types.SUCCESS
  },
  FLOATING_DEVICES_REQUEST: (state) => {
    state.floatingDevicesStatus = types.LOADING
  },
  FLOATING_DEVICES_UPDATED: (state, floatingDevices) => {
    state.floatingDevices = floatingDevices
    state.floatingDevicesStatus = types.SUCCESS
  },
  REALMS_REQUEST: (state) => {
    state.realmsStatus = types.LOADING
  },
  REALMS_UPDATED: (state, realms) => {
    state.realms = realms
    state.realmsStatus = types.SUCCESS
  },
  ROLES_REQUEST: (state) => {
    state.rolesStatus = types.LOADING
  },
  ROLES_UPDATED: (state, roles) => {
    state.roles = roles
    state.rolesStatus = types.SUCCESS
  },
  SCANS_REQUEST: (state) => {
    state.scansStatus = types.LOADING
  },
  SCANS_UPDATED: (state, scans) => {
    state.scans = scans
    state.scansStatus = types.SUCCESS
  },
  SOURCES_REQUEST: (state) => {
    state.sourcesStatus = types.LOADING
  },
  SOURCES_UPDATED: (state, sources) => {
    state.sources = sources
    state.sourcesStatus = types.SUCCESS
  },
  SWICTHES_REQUEST: (state) => {
    state.switchesStatus = types.LOADING
  },
  SWICTHES_UPDATED: (state, switches) => {
    state.switches = switches
    state.switchesStatus = types.SUCCESS
  },
  SWICTH_GROUPS_REQUEST: (state) => {
    state.switchGroupsStatus = types.LOADING
  },
  SWICTH_GROUPS_UPDATED: (state, switchGroups) => {
    state.switchGroups = switchGroups
    state.switchGroupsStatus = types.SUCCESS
  },
  TENANTS_REQUEST: (state) => {
    state.tenantsStatus = types.LOADING
  },
  TENANTS_UPDATED: (state, tenants) => {
    state.tenants = tenants
    state.tenantsStatus = types.SUCCESS
  },
  SECURITY_EVENTS_REQUEST: (state) => {
    state.security_eventsStatus = types.LOADING
  },
  SECURITY_EVENTS_UPDATED: (state, security_events) => {
    let ref = {}
    for (let security_event of security_events) {
      ref[security_event.id] = Object.assign({}, security_event)
    }
    state.security_events = ref
    state.security_eventsStatus = types.SUCCESS
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
