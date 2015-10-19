**************
Synnefo UI app
**************

`snf-ui-app` is the UI component of Synnefo IaaS platform.


Install
=======

Install `snf-ui-app` using ::

    $ apt-get install snf-ui-app

Apply ui settings in `/etc/synnefo/20-snf-ui-settings.conf` according 
to your deployment needs.


Project status
==============

The package only includes the Pithos UI webapp.


Packaging
=========

The package is `devflow` ready. In order to be able to buld the package you 
need to have a `nodejs` and `npm` installed on your system.

Node.js package for Debian systems is available via `nodesource.com`::

    $ cat << 'EOF' >> /etc/apt/sources.list.d/nodejs.list
      
    deb https://deb.nodesource.com/node_0.12 wheezy main
    deb-src https://deb.nodesource.com/node_0.12 wheezy main
    EOF

    $ curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
    $ apt-get install apt-transport-https
    $ apt-get update
    $ apt-get install nodejs

To create a `devflow` package go to the root of the project repo and run::

    $ devflow-autopkg


Development
===========

* Install Synnefo
* Let django serve the static files of the synnefo components::
    
    $ vim /etc/synnefo/99-local.conf
    WEBPROJECT_SERVE_STATIC = True

* Remove static file sharing from apache configuration. Comment out any static
  files related configuration directive in
  `/etc/apache2/sites-available/synnefo-ssl`

* Build ember project with explicit output location::

  $ cd snf-ui
  $ ember build --watch --output-path ../synnefo_ui/static/snf-ui
