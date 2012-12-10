/**
 * Application bootstrap file
 *
 * @author Denis Zenkovich
 */

/**
 * Resources loader
 *
 * @type {Object} Singleton
 */
var Loader = (function(){
    var _allScripts = []; //saves all loaded scripts just in case

    return {
        /**
         * load the requested script
         *
         * @param url
         * @param callback
         * @param context
         */
        load: function(url, callback, context){
            var i;
            var done; //all scripts loaded callback
            var getScript;
            var scripts = []; //scripts loading in this batch
            var inProgress = 0; //count of scripts in the progress of loading

            if(!$.isArray(url)) url = [url];

            done = function(){
                //run the callback, pass all loaded scripts and let it decide if the failed or not
                if(typeof callback == 'function'){
                    if(typeof context == 'object'){
                        callback.call(context, scripts);
                    }
                    else{
                        callback(scripts);
                    }
                }
            };

            getScript = function(url){
                var script;
                var extension;
                var dataType = 'script';

                if(_allScripts[url]){
                    return _allScripts[url];
                }

                extension = url.split('.').pop();
                if(extension == 'html' || extension == 'htm'){
                    dataType = 'html';
                }

                script = {
                    url: url,
                    loaded: false
                };

                $.ajax({
                    url: url,
                    dataType: dataType,
                    complete: function(jqXHR, textStatus){
                        inProgress--;
                        script.isSuccess = (textStatus == 'success');
                        script.loaded = true;
                        if(dataType == 'html'){
                            script.html = jqXHR.responseText;
                        }
                        if(inProgress === 0){
                            if(typeof done == 'function') done();
                        }
                    }
                });

                inProgress++;
                _allScripts[url] = script;
                return script;
            };

            for(i = 0; i < url.length; i++){
                scripts[url[i]] = getScript(url[i]);
            }
        }
    };
}());

$(function(){
    //start the application when all scripts are loaded
    var start = function(){

        var App = new AppView({
            el: $('#header')
        });

    };

    //load dependencies
    Loader.load([
        'ui/js/models.js',
        'ui/js/views.js'
    ], start);
});