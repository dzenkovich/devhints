/**
 * @fileOverview Developer Hints bootstrap file, handles application start and holds utilities such as Resources Loader
 * @author <a href="http://dzenkovich.com">Denis Zenkovich</a>
 * @version 0.1
 */

/**
 * DevHints Namespace
 *
 * @type {Namespace}
 */
var DH = DH || {}; //ensure namespace

/**
 * Resources loader Singleton
 *
 * @type {Object}
 */
var Loader = (function(){
    var _allScripts = []; //saves all loaded scripts just in case

    return {
        /**
         * loads the requested script or batch of scripts and toggles provided callback when all done
         *
         * @param {Array|String} url Single url string or array of items to load in a batch
         * @param {Function} callback The function to execute when loading finished
         * @param {Object} context If provided callback will be run as if method of this object
         */
        load: function(url, callback, context){
            var i;
            var done; //all scripts loaded callback
            var getScript;
            var scripts = []; //scripts loading in this batch
            var inProgress = 0; //count of scripts in the progress of loading

            if(!$.isArray(url)) url = [url];

            /**
             * All scripts loaded callback
             */
            done = function(){
                //run the callback, pass all loaded scripts and let it decide if loading failed or not
                if(typeof callback == 'function'){
                    if(typeof context == 'object'){
                        callback.call(context, scripts);
                    }
                    else{
                        callback(scripts);
                    }
                }
            };

            /**
             * Load script/template item
             *
             * @param {String} url
             * @return {Object} Object of item being loaded
             */
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
                    url: url
                };

                //TODO use script tags during development, switch to ajax later on.
                if(dataType == 'script'){
                    var scriptTag = $('<script></script>').attr('src', url).load(function(){
                        inProgress--;
                        script.isSuccess = 'success';
                        if(dataType == 'html'){
                            script.html = jqXHR.responseText;
                        }
                        if(inProgress === 0){
                            if(typeof done == 'function') done();
                        }
                    }).get(0);
                    document.body.appendChild(scriptTag);
                }
                //use JS ajax to load templates
                else{
                    $.ajax({
                        url: url,
                        dataType: dataType,
                        complete: function(jqXHR, textStatus){
                            inProgress--;
                            script.isSuccess = (textStatus == 'success');
                            if(dataType == 'html'){
                                script.html = jqXHR.responseText;
                            }
                            if(inProgress === 0){
                                if(typeof done == 'function') done();
                            }
                        }
                    });
                }

                inProgress++;
                _allScripts[url] = script;
                return script;
            };

            //start loading
            for(i = 0; i < url.length; i++){
                scripts[url[i]] = getScript(url[i]);
            }
        }
    };
}());

/**
 * Singleton for storing all available templates
 *
 * @type {Object}
 */
var Templates = {
    templates: {}, //hash of available templates

    /**
     * load the file and get templates from it
     *
     * @param {String} url
     */
    load: function(url){
        Loader.load(url, function(scripts){
            var script = scripts[url];

            if(script.isSuccess){
                Templates.parse(script.html);
            }
        }, this);
    },

    /**
     * parse given html chunk for script tags that are templates
     *
     * @param {String} html html to be parsed
     */
    parse: function(html){
        $(html).each(function(){
            var tpl = $(this);
            if(tpl.is('script')){
                Templates.templates[tpl.attr('id')] = tpl.html();
            }
        })
    },

    /**
     * Return the template by the given name
     *
     * @param {String} name template name
     * @return {String} template the template object
     */
    get: function(name){
        if(this.templates[name]){
            return this.templates[name];
        }
        else {
            throw 'Template "'+name+'" not found!';
        }
    }
};

//Load all known templates
//TODO figure out on demand loader logic
Templates.load('/ui/tpl/app.tpl.html');
Templates.load('/ui/tpl/elements.tpl.html');
Templates.load('/ui/tpl/modal.tpl.html');
Templates.load('/ui/tpl/add-page-form.tpl.html');
Templates.load('/ui/tpl/page.tpl.html');
Templates.load('ui/tpl/block.tpl.html');
Templates.load('ui/tpl/item.tpl.html');

$(function(){
    //start the application when all scripts are loaded
    var start = function(){

        DH.App = new DH.AppView({
            el: $('#app')
        });

    };

    //load dependencies
    Loader.load([
        '/ui/js/elements.js',
        '/ui/js/models.js',
        '/ui/js/views.js'
    ], start);
});