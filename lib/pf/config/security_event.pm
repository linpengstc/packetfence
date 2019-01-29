package pf::config::security_event;

=head1 NAME

pf::config::security_event -

=cut

=head1 DESCRIPTION

pf::config::security_event

=cut

use strict;
use warnings;
use pfconfig::cached_array;

tie our @BANDWIDTH_EXPIRED_SECURITY_EVENTS, 'pfconfig::cached_array' => 'resource::bandwidth_expired_security_events';
tie our @ACCOUNTING_TRIGGERS, 'pfconfig::cached_array' => 'resource::accounting_triggers';

BEGIN {
    use Exporter ();
    our ( @ISA, @EXPORT );
    @ISA = qw(Exporter);
    @EXPORT = qw(
        @BANDWIDTH_EXPIRED_SECURITY_EVENTS
        @ACCOUNTING_TRIGGERS
    );
}


=head1 AUTHOR

Inverse inc. <info@inverse.ca>

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

1;
