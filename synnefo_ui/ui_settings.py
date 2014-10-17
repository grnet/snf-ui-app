# Copyright (C) 2010-2014 GRNET S.A.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


"""
Settings for the snf-ui-app.
"""

# --------------------------------------------------------------------
# Process UI settings

from django.conf import settings
from collections import OrderedDict
from synnefo.lib import parse_base_url

BASE_URL = getattr(settings, 'UI_BASE_URL',
                   'https://synnefo.live/ui/')

BASE_HOST, BASE_PATH = parse_base_url(BASE_URL)

AUTH_COOKIE_NAME = getattr(settings, 'UI_AUTH_COOKIE_NAME','_pithos2_a')
AUTH_URL = getattr(settings, 'UI_AUTH_URL', 'https://astakos.synnefo.live/astakos/identity/v2.0')

STORAGE_VIEW_URL = "https://pithos.synnefo.live/pithos/ui/view/";
