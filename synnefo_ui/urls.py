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
#

from functools import partial

from django.conf.urls import patterns, url, include
from snf_django.lib.api.proxy import proxy
from snf_django.lib.api.utils import prefix_pattern
from snf_django.lib.api.urls import api_patterns
from snf_django.lib.api import api_endpoint_not_found
from snf_django.utils.urls import extend_path_with_slash

from synnefo_ui.ui_settings import BASE_PATH, ASTAKOS_IDENTITY_PROXY_PATH, \
    ASTAKOS_IDENTITY_BASE_URL, ASTAKOS_ACCOUNT_PROXY_PATH, \
    ASTAKOS_ACCOUNT_BASE_URL

proxy_patterns = patterns('')

if ASTAKOS_IDENTITY_PROXY_PATH:
    identity_proxy = \
            partial(proxy, proxy_base=ASTAKOS_IDENTITY_PROXY_PATH,
                                target_base=ASTAKOS_IDENTITY_BASE_URL)
    proxy_patterns += api_patterns(
        '',
        (prefix_pattern(ASTAKOS_IDENTITY_PROXY_PATH), identity_proxy))

if ASTAKOS_ACCOUNT_PROXY_PATH:
    account_proxy = \
            partial(proxy, proxy_base=ASTAKOS_ACCOUNT_PROXY_PATH,
                                target_base=ASTAKOS_ACCOUNT_BASE_URL)
    proxy_patterns += api_patterns(
        '',
        (prefix_pattern(ASTAKOS_ACCOUNT_PROXY_PATH), account_proxy))


ui_patterns = patterns(
    'synnefo_ui.views',
    url(r'^.*$', 'app', name='ui-app'),
)

urlpatterns = proxy_patterns
urlpatterns += patterns(
    '',
    (prefix_pattern(BASE_PATH), include(ui_patterns)))


extend_path_with_slash(urlpatterns, BASE_PATH);
