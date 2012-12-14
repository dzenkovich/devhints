/**
 * UI blocks views and rendering logic
 *
 * @author Denis Zenkovich
 */
var DH = DH || {}; //ensure namespace

/**
 * The main view of application: page navigation/creation/deletion and etc
 *
 * @type {*}
 */
DH.AppView = Backbone.View.extend({
    router: null, //router controller
    pages: null, //pages collection
    pagesCache: {}, //hash of rendered pages for quick toggle
    _addModal: null, //add page modal view object
    _tpl: null, //saves tpl for re-renders

    events: {
        "click .j-add-page": "openPageAddModal"
    },

    initialize: function(){
        this.pages = new DH.PageCollection();
        this.pages.on('add', this.registerPage, this);
        this.pages.fetch();

        this.render();

        this.router = new Backbone.Router();
        this.router.route(':page/:block/:item', 'item');
        this.router.route(':page/:block', 'block');
        this.router.route(':page', 'page');
        this.router.on('route:page', this.openPage, this);
        Backbone.history.start({pushState: true, root: document.location.href.split('/').pop()});

        //register all page urls
        this.pages.each(function(page){
            this.router.route(page.get('url'), 'page');

        }, this);
    },

    render: function(){
        var resize;

        this.$el.html(Mustache.render(Templates.get('app'), {}));
        resize = function(){
            this.$el.css('min-height', $(window).height())
        }.bind(this);
        $(window).resize(resize);
        resize();
    },

    openPageAddModal: function(){

        if(!this._addModal){
            this._addModal = new DH.AddPageModalView();
        }

        this._addModal.open();
    },

    openPage: function(pageUrl){
        var pageModel;
        var pageView = null;

        //check for page in cache, if none - create a view for it and render
        if(!this.pagesCache[pageUrl]){
            pageModel = this.pages.findByUrl(pageUrl);
            if(pageModel){
                var pageView = new DH.PageView(pageModel);
                pageView.render();
                pageView.$el.hide().appendTo(this.$('.pages'));
            }
        }
        else{
            pageView = this.pagesCache[pageUrl];
        }

        if(pageView){
            this.$('.pages').removeClass('not-found');
            this.$('.pages .page').hide();
            pageView.$el.fadeIn();
        }
        else{
            this.$('.pages').addClass('not-found');
        }
    },

    addPage: function(data){
        var page = this.pages.create(data, {
            success: function(){
                debugger

                var pageUrl = page.get('url');
                this.router.navigate(pageUrl, {trigger: true});
            },
            error: function(){
                throw 'Server error while adding page.';
            }
        });

    }
});

/**
 * Add page modal interface
 *
 * @type {*}
 */
DH.AddPageModalView = DH.ModalView.extend({

    initialize: function(){
        DH.ModalView.prototype.initialize.call(this);

        this.render();
    },

    render: function(){
        var FieldTitle;
        var FieldSlug;
        var FieldDescription;

        this.Form = new DH.FormView();
        this.Form.$el = $(Mustache.render(Templates.get('add-page-form'), this.data));
        this.Form.on('submit', function(){
            this.addPage({
                title: FieldTitle.val(),
                url: FieldSlug.val(),
                description: FieldDescription.val()
            });
            this.close();
        }, this);

        FieldTitle = new DH.InputView({
            rules: {
                required: {
                    message: 'Please give page a title.'
                }
            }
        });
        FieldSlug = new DH.InputView({
            rules: {
                required: {
                    message: 'Please provide the url slug for this page.'
                }
            }
        });
        FieldDescription = new DH.AreaView();

        FieldTitle.render();
        FieldSlug.render();
        FieldDescription.render();

        //register fields to the form
        this.Form.register(FieldTitle, this.Form.$('.j-field-title'));
        this.Form.register(FieldSlug, this.Form.$('.j-field-slug'));
        this.Form.register(FieldDescription, this.Form.$('.j-field-description'));

        //remember to bind click handler to this object
        this.Form.$('.j-lnk-cancel').click(function(){
            this.hide();
        }.bind(this));
        //remember to bind click handler to this object
        this.Form.$('.j-btn-add').click(function(){
            this.Form.submit();
        }.bind(this));

        DH.ModalView.prototype.render.call(this); //render the generic modal we inherited

        this.setTitle('Add a Page');

        this._$content.append(this.Form.$el); //place the form
    },

    addPage: function(data){
        //TODO figure out better solution
        DH.App.addPage(data);
    }
});

/**
 * Page representation, linked to PageModel
 *
 * @type {*}
 */
DH.PageView = Backbone.View.extend({
    initialize: function(model){
        this.model = model;
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    render: function(){
        this.$el = $(Mustache.render(Templates.get('page'), this.model.attributes));
    },

    remove: function(){

    },

    editTitle: function(){

    },

    openAddBlock: function(){

    },

    addBlock: function(){

    }
});