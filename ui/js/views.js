/**
 * UI blocks views and rendering logic
 *
 * @author Denis Zenkovich
 */

/**
 * The main view of application: page navigation/creation/deletion and etc
 *
 * @type {*}
 */
var AppView = Backbone.View.extend({

    _tpl: null, //saves tpl for re-renders

    events: {
        "click": "openPageAddModal"
    },

    initialize: function(){
        Loader.load('ui/tpl/app.tpl.html', function(scripts){
            var script = scripts['ui/tpl/app.tpl.html'];

            if(script.isSuccess){
                this._tpl = script.html;
                this.render();
            }
        }, this);
    },

    render: function(){
        this.$el.html(Mustache.render(this._tpl, {}));
    },

    openPageAddModal: function(){

    }
})

/**
 * Generic modal window
 *
 * @type {*}
 */
var ModalView = Backbone.View.extend({
    _tpl: null, //saves tpl for re-renders
    _$content: null, //JQ modal content element
    _$header: null, //JQ modal header element

    _position: function(){

    },

    initialize: function(){
        Loader.load('ui/tpl/modal.tpl.html', function(scripts){
            var script = scripts['ui/tpl/modal.tpl.html'];

            if(script.isSuccess){
                this._tpl = script.html;
            }
        }, this);

        //create page overlay if none exist yet, use it as a static property through all modals
        if(!ModalView._$cover){
            ModalView._$cover = $('<div class="cover"></div>').appendTo(document.body);
        }
    },

    render: function(){
        this.$el.html(Mustache.render(this._tpl, {}));
        this._$content = this.$('.content');
        this._$header = this.$('.header');

    },

    setTitle: function(title){
        this.$('j-modal-title').html(title);
    },

    open: function(){

    },

    close: function(){

    }
});

/**
 * Add page modal interface, linked with AddPageModel
 *
 * @type {*}
 */
var AddPageModalView = ModalView.extend({



});