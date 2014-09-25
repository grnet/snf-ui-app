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

from urllib import unquote

from django.views.generic.simple import direct_to_template
from synnefo_ui import ui_settings

def home(request):

    extras_dict = {
        'NAME': 'olga',
        'UI_STATIC_MEDIA_URL': ui_settings.UI_STATIC_MEDIA_URL,
        'token': get_token_from_cookie(request, ui_settings.AUTH_COOKIE_NAME),
    }

    return direct_to_template(request, "ui/index.html",
                              extra_context=extras_dict)



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
