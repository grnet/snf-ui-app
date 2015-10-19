# Copyright (C) 2010-2015 GRNET S.A.
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

import os

from django.conf import settings
from synnefo.lib import parse_base_url


BASE_PATH = getattr(settings, 'UI_BASE_PATH', '/ui/')

AUTH_METHOD = getattr(settings, 'UI_AUTH_METHOD', 'cookie:_pithos2_a')

PROXY_PATH = getattr(settings, 'UI_ASTAKOS_PROXY_PATH', '_astakos')
ASTAKOS_IDENTITY_PROXY_PATH = getattr(settings,
                                'UI_ASTAKOS_IDENTITY_PROXY_PATH',
                                '%s%s/identity' % (BASE_PATH, PROXY_PATH))

ASTAKOS_ACCOUNT_PROXY_PATH = getattr(settings,
                                'UI_ASTAKOS_ACCOUNT_PROXY_PATH',
                                '%s%s/account' % (BASE_PATH, PROXY_PATH))

COMMON_AUTH_URL = getattr(settings, 'ASTAKOS_AUTH_URL', None)
ASTAKOS_ACCOUNT_BASE_URL = getattr(settings,
                                   'UI_ASTAKOS_ACCOUNT_BASE_URL',
                                   COMMON_AUTH_URL.replace('/identity/v2.0',
                                                           '/account/v1.0'))
ASTAKOS_IDENTITY_BASE_URL = getattr(settings,
                                   'UI_ASTAKOS_ACCOUNT_BASE_URL',
                                   COMMON_AUTH_URL)

AUTH_URL = ASTAKOS_IDENTITY_PROXY_PATH
if PROXY_PATH is None:
    AUTH_URL = COMMON_AUTH_URL
    if AUTH_URL is None:
        raise Exception("Please set the ASTAKOS_AUTH_URL path")
    ASTAKOS_ACCOUNT_PROXY_PATH = None
    ASTAKOS_IDENTITY_PROXY_PATH = None

UI_MEDIA_URL = getattr(settings, 'MEDIA_URL', '/media/') + 'snf-ui/'


MODULE_PATH = os.path.join(os.path.dirname(__file__), "static", "snf-ui")
WEB_DIST_DIR = os.path.abspath(MODULE_PATH)
TEMPLATE_DIRS = list(getattr(settings, 'TEMPLATE_DIRS', []))
if not WEB_DIST_DIR in getattr(settings, 'TEMPLATE_DIRS'):
    TEMPLATE_DIRS.append(WEB_DIST_DIR)
    setattr(settings, 'TEMPLATE_DIRS', TEMPLATE_DIRS)
