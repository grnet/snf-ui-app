module.exports = {
  appName: 'pithos-ui',
  platforms: ['osx64', 'win64', 'linux64', 'linux32'],
  buildType: function() {
    var date = new Date();
    var _d = date.getFullYear() + '' + 
             (date.getMonth() + 1) + '' + 
             date.getDate() + '' + 
             date.getHours() + '' +
             date.getSeconds();
    return this.appName + "-" + this.appVersion + "-nw-" + _d;
  }
};
