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

import json

from urllib import unquote

from django.views.generic.simple import direct_to_template
from django.conf import settings
from synnefo_branding import settings as branding_settings


from synnefo_ui import ui_settings
from astakosclient import AstakosClient, parse_endpoints


def home(request):

    token = get_token_from_cookie(request, ui_settings.AUTH_COOKIE_NAME)

    app_settings = {
        'service_name': branding_settings.SERVICE_NAME,
        'logo_url': branding_settings.IMAGE_MEDIA_URL + 'dashboard_logo.png',
        'token': token,
        'storage_url': get_publicURL_by_service(token, 'object-store'),
        'weblogin_url': get_publicURL_by_service(token, 'astakos_weblogin'),
        'account_url': get_publicURL_by_service(token, 'account'),
        'storage_host': get_publicURL_by_service(token, 'object-store') + '/' + request.user.uuid,
        'uuid': request.user.uuid,
        'storage_view_url': ui_settings.STORAGE_VIEW_URL,

    }
    
    context = {
        'app_settings': json.dumps(app_settings)
    }

    return direct_to_template(request, "ui/index.html", extra_context=context)



def get_token_from_cookie(request, cookiename):
    """Extract token from provided cookie.

    Extract token from the cookie name provided. Cookie should be in the same
    form as astakos service sets its cookie contents::

        <user_uniq>|<user_token>
    """
    try:
        cookie_content = unquote(request.COOKIES.get(cookiename, None))
        return cookie_content.split("|")[1]
    except AttributeError:
        pass

    return None


def get_publicURL_by_service(token, service_type):
    """
    Extract endpoint publicURL from token and service type
    """

    auth_url =  ui_settings.AUTH_URL
    astakos_client = AstakosClient(token, auth_url)
    endpoint = parse_endpoints(astakos_client.get_endpoints(), ep_type=service_type)
    publicURL = endpoint[0]['endpoints'][0]['publicURL']
    return publicURL



