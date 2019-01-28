import apiCall from '@/utils/api'

export default {
  all: params => {
    if (params.sort) {
      params.sort = params.sort.join(',')
    } else {
      params.sort = 'mac'
    }
    if (params.fields) {
      params.fields = params.fields.join(',')
    }
    return apiCall.get('nodes', { params }).then(response => {
      return response.data
    })
  },
  search: body => {
    return apiCall.post('nodes/search', body).then(response => {
      return response.data
    })
  },
  node: mac => {
    return apiCall.get(`node/${mac}`).then(response => {
      return response.data.item
    })
  },
  fingerbankInfo: mac => {
    return apiCall.getQuiet(`node/${mac}/fingerbank_info`).then(response => {
      return response.data.item
    })
  },
  ip4logOpen: mac => {
    return apiCall.getQuiet(`ip4logs/open/${mac}`).then(response => {
      return response.data.item
    })
  },
  ip4logHistory: mac => {
    return apiCall.getQuiet(`ip4logs/history/${mac}`).then(response => {
      return response.data.items
    })
  },
  ip6logOpen: mac => {
    return apiCall.getQuiet(`ip6logs/open/${mac}`).then(response => {
      return response.data.item
    })
  },
  ip6logHistory: mac => {
    return apiCall.getQuiet(`ip6logs/history/${mac}`).then(response => {
      return response.data.items
    })
  },
  locationlogs: mac => {
    const search = {
      query: { op: 'and', values: [ { field: 'mac', op: 'equals', value: mac } ] },
      limit: 100,
      cursor: '0'
    }
    return apiCall.post('locationlogs/search', search).then(response => {
      return response.data.items
    })
  },
  security_events: mac => {
    const search = {
      query: { op: 'and', values: [ { field: 'mac', op: 'equals', value: mac } ] },
      limit: 100,
      cursor: '0'
    }
    return apiCall.post('security_events/search', search).then(response => {
      return response.data.items
    })
  },
  dhcpoption82: mac => {
    const search = {
      query: { op: 'and', values: [ { field: 'mac', op: 'equals', value: mac } ] },
      limit: 100,
      cursor: '0'
    }
    return apiCall.post('dhcp_option82s/search', search).then(response => {
      return response.data.items
    })
  },
  createNode: body => {
    return apiCall.post('nodes', body).then(response => {
      return response.data
    })
  },
  updateNode: body => {
    return apiCall.patch(`node/${body.mac}`, body).then(response => {
      return response.data
    })
  },
  deleteNode: mac => {
    return apiCall.delete(`node/${mac}`)
  },
  registerBulkNodes: body => {
    return apiCall.post('nodes/bulk_register', body).then(response => {
      return response.data
    })
  },
  deregisterBulkNodes: body => {
    return apiCall.post('nodes/bulk_deregister', body).then(response => {
      return response.data
    })
  },
  clearSecurityEventNode: mac => {
    return apiCall.post(`node/${mac}/closesecurity_events`).then(response => {
      return response.data
    })
  },
  applySecurityEventBulkNodes: body => {
    return apiCall.post('nodes/bulk_apply_security_event', body).then(response => {
      return response.data
    })
  },
  clearSecurityEventBulkNodes: body => {
    return apiCall.post('nodes/bulk_close_security_events', body).then(response => {
      return response.data
    })
  },
  reevaluateAccessBulkNodes: body => {
    return apiCall.post('nodes/bulk_reevaluate_access', body).then(response => {
      return response.data
    })
  },
  restartSwitchportBulkNodes: body => {
    return apiCall.post('nodes/bulk_restart_switchport', body).then(response => {
      return response.data
    })
  },
  refreshFingerbankBulkNodes: body => {
    return apiCall.post('nodes/bulk_fingerbank_refresh', body).then(response => {
      return response.data
    })
  },
  roleBulkNodes: body => {
    return apiCall.post('nodes/bulk_apply_role', body).then(response => {
      return response.data
    })
  },
  bypassRoleBulkNodes: body => {
    return apiCall.post('nodes/bulk_apply_bypass_role', body).then(response => {
      return response.data
    })
  },
  reevaluateAccessNode: mac => {
    return apiCall.postQuiet(`node/${mac}/reevaluate_access`).then(response => {
      return response.data
    })
  },
  refreshFingerbankNode: mac => {
    return apiCall.postQuiet(`node/${mac}/fingerbank_refresh`).then(response => {
      return response.data
    })
  },
  restartSwitchportNode: mac => {
    return apiCall.postQuiet(`node/${mac}/restart_switchport`).then(response => {
      return response.data
    })
  }
}
