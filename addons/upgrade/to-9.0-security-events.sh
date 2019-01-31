#!/bin/bash

SED_BAK_SUFFIX=".pre-9.0-security-events-script"

echo "Moving violations.conf to security_events.conf"
yes | mv /usr/local/pf/conf/violations.conf /usr/local/pf/conf/security_events.conf

echo "Renaming values in adminroles.conf"
sed -i$SED_BAK_SUFFIX 's/VIOLATIONS_/SECURITY_EVENTS_/g' /usr/local/pf/conf/adminroles.conf

echo "Renaming violation_maintenance task in pfmon"
sed -i$SED_BAK_SUFFIX 's/violation_maintenance/security_event_maintenance/g' /usr/local/pf/conf/pfmon.conf

echo "Renaming violations related data in filter engines files (VLAN and RADIUS filters along with WMI rules)"
for F in /usr/local/pf/conf/radius_filters.conf /usr/local/pf/conf/vlan_filters.conf /usr/local/pf/conf/wmi.conf; do
  sed -i$SED_BAK_SUFFIX 's/^filter\s*=\s*violation/filter = security_event/g' $F
  sed -i$SED_BAK_SUFFIX 's/trigger_violation/trigger_security_event/g' $F
  sed -i$SED_BAK_SUFFIX 's/ViolationRole/IsolationRole/g' $F
done

echo "Renaming violations related data in stats.conf"
sed -i$SED_BAK_SUFFIX 's/source\.packetfence\.violations/source.packetfence.security_events/g' /usr/local/pf/conf/stats.conf
sed -i$SED_BAK_SUFFIX 's/from violation/from security_event/g' /usr/local/pf/conf/stats.conf

echo "Renaming API calls in pfdetect.conf"
sed -i$SED_BAK_SUFFIX 's/trigger_violation/trigger_security_event/g' /usr/local/pf/conf/pfdetect.conf

echo "Renaming existing violation.log to security_event.log"
yes | mv /usr/local/pf/logs/violation.log /usr/local/pf/logs/security_event.log

echo "Renaming portal templates directories"
find /usr/local/pf/html/captive-portal/profile-templates/ -mindepth 1 -maxdepth 1 -type d -exec /bin/bash -c '[ -d {}/violations ] && echo "Renaming violations directory for profile {}" && mv {}/violations {}/security_events' \;

echo "Completed renaming"
