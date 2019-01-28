package pfappserver::PacketFence::Controller::Configuration;

=head1 NAME

pfappserver::PacketFence::Controller::Configuration - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller.

=cut

use strict;
use warnings;

use Date::Parse;
use HTTP::Status qw(:constants is_error is_success);
use Moose;
use namespace::autoclean;
use POSIX;
use URI::Escape::XS;
use pf::log;
use Tie::IxHash;
use MIME::Lite;
use pf::config::util;

use pf::util qw(load_oui download_oui);
# imported only for the $TIME_MODIFIER_RE regex. Ideally shouldn't be
# imported but it's better than duplicating regex all over the place.
use pf::config qw(
    access_duration
    %Doc_Config
);
use pf::admin_roles;
use pfappserver::Form::Config::Pf;
use pf::constants::pfconf;

BEGIN {extends 'pfappserver::Base::Controller'; }

=head1 METHODS

=head2 index

=cut

sub index :Path :Args(0) { }

=head2 section

The generic handler for all pf sections

=cut

sub section :Path :Args(1) :AdminRole('CONFIGURATION_MAIN_READ') {
    my ($self, $c, $section) = @_;
    my $logger = get_logger();

    $c->stash->{doc_anchor} = exists($Doc_Config{$section}) ? $Doc_Config{$section}{guide_anchor} : undef;

    if (exists $pf::constants::pfconf::ALLOWED_SECTIONS{$section} ) {
        my ($params, $form);
        my ($status,$status_msg,$results);

        $c->stash->{section} = $section;
        $c->stash(fingerbank_configured => fingerbank::Config::is_api_key_configured);

        my $model = $c->model('Config::Pf');
        $form = $c->form("Config::Pf", section => $section);
        if ($c->request->method eq 'POST') {
            if(admin_can([$c->user->roles], 'CONFIGURATION_MAIN_UPDATE')) {
                $form->process(params => $c->req->params);
                $logger->info("Processed form");
                if ($form->has_errors) {
                    $status = HTTP_PRECONDITION_FAILED;
                    $status_msg = $form->field_errors;
                } else {
                    ($status,$status_msg) = $model->update($section, $form->value);
                    if (is_success($status)) {
                        ($status,$status_msg) = $model->commit();
                    }
                    $self->audit_current_action($c, status => $status, action => 'update', section => $section);
                }
            } else {
                $c->response->status(HTTP_UNAUTHORIZED);
                $c->stash->{status_msg} = "You don't have the rights to perform this action.";
                $c->stash->{current_view} = 'JSON';
                $c->detach();
            }
        } else {
            ($status,$results) = $model->read($section);
            if (is_success($status)) {
                $form->process(init_object => $results);
                $c->stash->{form} = $form;
            } else {
                $status_msg = $results;
            }
        }
        if(is_error($status)) {
            $c->stash(
                current_view => 'JSON',
                status_msg => $status_msg
            );
        }
        $c->response->status($status);
    } else {
        $c->go('Root','default');
    }
}

=head2 duration

Given the number of seconds since the Epoch and a trigger, returns the formatted end date.

=cut

sub duration :Local :Args(2) {
    my ($self, $c, $time, $trigger) = @_;

    my $status = HTTP_PRECONDITION_FAILED;
    if ($time && $trigger) {
        my $duration = access_duration($trigger, $time);
        if ($duration) {
            $status = HTTP_OK;
            $c->stash->{status_msg} = $duration;
        }
    }
    $c->stash->{current_view} = 'JSON';
    $c->response->status($status);
}

=head2 switches

=cut

sub switches :Local {
    my ($self, $c, $name) = @_;

    $c->stash->{tab} = $name;
    $c->forward('_handle_tab_view');
}

=head2 floating_devices

=cut

sub floating_devices :Local {
    my ($self, $c) = @_;

    $c->go('Controller::Config::FloatingDevice', 'index');
}

=head2 authentication

=cut

sub authentication :Local {
    my ($self, $c) = @_;

    $c->go('Controller::Config::Source', 'index');
}

=head2 users

=cut

sub users :Local {
    my ($self, $c) = @_;

    $c->go('Controller::User', 'create');
}

=head2 security_events

=cut

sub security_events :Local {
    my ($self, $c) = @_;

    $c->go('Controller::SecurityEvent', 'index');
}

=head2 domains

=cut

sub domains :Local {
    my ($self, $c, $name) = @_;

    $c->stash->{tab} = $name;
    $c->forward('_handle_tab_view');
}

=head2 main

=cut

sub main :Local {
    my ($self, $c, $name) = @_;

    $c->stash->{tab} = $name;

    $c->forward('_handle_tab_view');
}

=head2 database

=cut

sub database :Local {
    my ($self, $c, $name) = @_;

    $c->stash->{tab} = $name;
    $c->forward('_handle_tab_view');
}

=head2 scans

=cut

sub scans :Local {
    my ($self, $c, $name) = @_;

    $c->stash->{tab} = $name;

    $c->forward('_handle_tab_view');
}

=head2 profiling

=cut

sub profiling :Local {
    my ($self, $c, $name) = @_;

    $c->stash->{tab} = $name;

    $c->forward('_handle_tab_view');
}

=head2 networks

=cut

sub networks :Local {
    my ($self, $c, $name) = @_;

    $c->stash->{tab} = $name;

    $c->forward('_handle_tab_view');
}

=head2 network_conf

=cut

sub network_conf :Local {
    my ($self, $c) = @_;

    $c->stash->{template} = "configuration/network_conf.tt";
}

=head2 define_policy

=cut

sub define_policy :Local {
    my ($self, $c) = @_;

    $c->stash->{template} = "configuration/define_policy.tt";
}

=head2 system_config

=cut

sub system_config :Local {
    my ($self, $c) = @_;

    $c->stash->{template} = "configuration/system_config.tt";
}

=head2 portal_config

=cut

sub portal_config :Local {
    my ($self, $c) = @_;

    $c->stash->{template} = "configuration/portal_config.tt";
}

=head2 compliance

=cut

sub compliance :Local {
    my ($self, $c) = @_;

    $c->stash->{template} = "configuration/compliance.tt";
}

=head2 integration

=cut

sub integration :Local {
    my ($self, $c) = @_;

    $c->stash->{template} = "configuration/integration.tt";
}

=head2 _handle_tab_view

Handle the tab view rendering of a super-section

=cut

sub _handle_tab_view : Private {
    my ($self, $c) = @_;

    $c->stash->{tabs} = $c->forward('all_subsections')->{$c->action->name};

    my $name = $c->stash->{tab} // (keys(%{$c->stash->{tabs}}))[0];
    $c->stash->{tab} = $name;
    my $current_tab = $c->stash->{tabs}->{$name};

    my $action = $current_tab->{action} // "index";
    $c->visit($current_tab->{controller}, $action, $current_tab->{action_args});
    $c->stash->{inner_content} = $c->response->body;
    $c->response->body(undef);
    $c->stash->{template} = "configuration/" . $c->action->name . ".tt";
}

=head2 all_subsections

Returns the definitions of all 'super-sections' that contain a group of sections

=cut

sub all_subsections : Private {
    my ($self, $c) = @_;

    return {
        database => sub {
            tie my %map, 'Tie::IxHash', (
                database => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['database'],
                    name => 'General', 
                },
                database_advanced => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['database_advanced'],
                    name => 'Advanced', 
                },
            );
            return \%map;
        }->(),

        domains => sub {
            tie my %map, 'Tie::IxHash', (
                domain => {
                    controller => 'Controller::Config::Domain',
                    name => 'Active Directory Domains', 
                },
                realm => { 
                    controller => 'Controller::Config::Realm',
                    name => 'REALMS',
                },
            );
            return \%map;
        }->(),

        switches => sub {
            tie my %map, 'Tie::IxHash', (
                switch => {
                    controller => 'Controller::Config::Switch',
                    name => 'Switches',
                },
                switch_group => {
                    controller => 'Controller::Config::SwitchGroup',
                    name => 'Switch Groups',
                },
            );
            return \%map;
        }->(),

        main => sub {
            tie my %map, 'Tie::IxHash', (
                general => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['general'],
                    name => 'General Configuration', 
                },
                alerting => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['alerting'],
                    name => 'Alerting', 
                },
                advanced => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['advanced'],
                    name => 'Advanced', 
                },
                maintenance => {
                    controller => 'Controller::Config::Pfmon',
                    name => 'Maintenance', 
                },
                services => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['services'],
                    name => 'Services', 
                },
            );
            return \%map;
        }->(),

        networks => sub {
            tie my %map, 'Tie::IxHash', (
                network => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['network'],
                    name => 'Network Settings', 
                },
                interfaces => {
                    controller => 'Controller::Interface',
                    name => 'Interfaces', 
                },
                inline => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['inline'],
                    name => 'Inline', 
                },
                trafficshaping => {
                    controller => 'Controller::Config::TrafficShaping',
                    name => 'Inline Traffic Shaping',
                },
                fencing => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['fencing'],
                    name => 'Fencing', 
                },
                parking => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['parking'],
                    name => 'Device Parking', 
                },
            );
            return \%map;
        }->(),

        profiling => sub {
            tie my %map, 'Tie::IxHash', (
                general => {
                    controller => 'Controller::Config::Fingerbank::Settings',
                    name => 'General Settings', 
                },
                device_change => {
                    controller => 'Controller::Configuration',
                    action => 'section',
                    action_args => ['fingerbank_device_change'],
                    name => 'Device change detection', 
                },
                combinations => {
                    controller => 'Controller::Config::Fingerbank::Combination',
                    name => 'Combinations', 
                },
                devices => {
                    controller => 'Controller::Config::Fingerbank::Device',
                    name => 'Devices', 
                },
                dhcp_fingerprints => {
                    controller => 'Controller::Config::Fingerbank::DHCP_Fingerprint',
                    name => 'DHCP Fingerprints', 
                },
                dhcp_vendors => {
                    controller => 'Controller::Config::Fingerbank::DHCP_Vendor',
                    name => 'DHCP Vendors', 
                },
                dhcp6_fingerprints => {
                    controller => 'Controller::Config::Fingerbank::DHCP6_Fingerprint',
                    name => 'DHCPv6 Fingerprints', 
                },
                dhcp6_enterprises => {
                    controller => 'Controller::Config::Fingerbank::DHCP6_Enterprise',
                    name => 'DHCPv6 Enterprises', 
                },
                mac_vendors => {
                    controller => 'Controller::Config::Fingerbank::MAC_Vendor',
                    name => 'MAC Vendors', 
                },
                user_agents => {
                    controller => 'Controller::Config::Fingerbank::User_Agent',
                    name => 'User Agents',
                },
            );
            return \%map;
        }->(),
        
        scans => sub {
            tie my %map, 'Tie::IxHash', (
                scan_engines => {
                    controller => 'Controller::Config::Scan',
                    name => 'Scan Engines', 
                },
                wmi_rules => {
                    controller => 'Controller::Config::WMI',
                    name => 'WMI Rules', 
                },
            );
            return \%map;
        }->(),

    }
}

sub test_smtp : Local {
    my ($self, $c) = @_;
    my $form = $c->form("Config::Pf", section => "alerting"); 
    my ($status, $status_msg) = (200, "success");
    $form->process(params => $c->request->params);
    if ($form->has_errors) {
        $status = HTTP_PRECONDITION_FAILED;
        $status_msg = $form->field_errors;
    } else {
        my $alerting_config = $form->value;
        my $email = $c->request->param('test_emailaddr') || $alerting_config->{emailaddr};
        my $msg = MIME::Lite->new(
            To => $email,
            Subject => "PacketFence SMTP Test",
            Data => "PacketFence SMTP Test successful!\n"
        );

        my $results = eval {
            pf::config::util::do_send_mime_lite($msg, %$alerting_config);
        };
        # the variable $@ holds the error
        if ($@) {
            $status = 400;
            $status_msg = pf::util::strip_filename_from_exceptions($@);
        }
    }

    $c->response->status($status);
    $c->stash->{status_msg} = $status_msg; # TODO: localize status message
    $c->stash->{current_view} = 'JSON';
}

=head1 COPYRIGHT

Copyright (C) 2005-2018 Inverse inc.

=head1 LICENSE

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
USA.

=cut

__PACKAGE__->meta->make_immutable unless $ENV{"PF_SKIP_MAKE_IMMUTABLE"};

1;
