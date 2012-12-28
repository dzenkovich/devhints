/**
 * UI blocks views and rendering logic
 *
 * @author Denis Zenkovich
 */
var DH = DH || {}; //ensure namespace

/**
 * The main view of application: page navigation/creation/deletion and etc
 *
 * @type {View}
 */
DH.AppView = Backbone.View.extend({
    router: null, //router controller
    pages: null, //pages collection
    pagesCache: {}, //hash of rendered pages for quick toggle
    _addModal: null, //add page modal view object
    _tpl: null, //saves tpl for re-renders
    navDropdown: null, //pages navigation dropdown

    events: {
        "click .j-add-page": "openPageAddModal"
    },

    initialize: function(){
        this.pages = new DH.PageCollection();
        this.pages.on('add', this.registerPage, this);
        this.pages.fetch({
            success: function(pages, response){
                this.render();
            }.bind(this),
            error: function(){
                throw 'Server error while attempting to load pages.';

                this.render();
            }.bind(this)
        });
    },

    setRouter: function(){
        this.router = new Backbone.Router();
        this.router.route('', 'home');
        this.router.route(':page', 'page');
        //this.router.route(':page/:block', 'block');
        //this.router.route(':page/:block/:item', 'item');
        this.router.on('route:page', this.openPage, this);
        this.router.on('route:home', this.openHomepage, this);
        Backbone.history.start({pushState: true});
    },

    render: function(){
        var resize; //window resize callback to ensure we don't get dumb whitespace in the footer
        var pagesList = []; //array of pages nav options
        var defaultText = null; //default dropdown text
        var pagesData = null; //data about existing pages for tpl rendering

        this.$el.html(Mustache.render(Templates.get('app'), {}));

        if(this.pages.length){
            defaultText = 'Please select a page';
            this.pages.each(function(page){
                pagesList.push({
                    text: page.get('title'),
                    value: page.get('url')
                });
            });
        }
        else{
            defaultText = 'No pages present';
        }

        this.$('.logo').click(function(){
            this.router.navigate('', {trigger: true});
        }.bind(this));

        this.navDropdown = new DH.DropdownView({options: pagesList});
        this.navDropdown.on('change', function(data){
            this.router.navigate(data.value, {trigger: true});
        }, this);
        this.navDropdown.render(defaultText);
        this.$('.nav-dropdown').append(this.navDropdown.$el);

        pagesData = [];
        this.pages.each(function(page){
            pagesData.push({
                title: page.get('title'),
                url: page.get('url'),
                description: page.get('description')
            });
        });
        $(Mustache.render(Templates.get('homepage'), {pages: pagesData}))
            .appendTo(this.$('.pages'))
            .find('.pages-list .item a').click(function(e){
                this.router.navigate($(e.target).attr('href'), {trigger: true});

                e.preventDefault();
        }.bind(this));

        this.setRouter();

        resize = function(){
            this.$el.css('min-height', $(window).height());
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
                pageModel.on('change', function(){
                    pageView.render();
                });
                pageView.$el.hide().appendTo(this.$('.pages'));
            }
        }
        else{
            pageView = this.pagesCache[pageUrl];
        }

        if(pageView){
            this.$('.pages').removeClass('not-found open-homepage');
            this.$('.pages .page').hide();
            pageView.$el.fadeIn();
            this.navDropdown.select(pageUrl, {silent: true});
        }
        else{
            this.$('.pages').addClass('not-found');
        }
    },

    openHomepage: function(){
        this.$('.pages .page').hide();
        this.$('.pages').addClass('open-homepage');
        this.navDropdown.reset();
    },

    createPage: function(data){
        var page = this.pages.create(data, {
            success: function(){
                var pageUrl = page.get('url');
                this.router.navigate(pageUrl, {trigger: true});
            }.bind(this),
            error: function(){
                throw 'Server error while adding page.';
            }
        });
    },

    /**
     * Register any page added by fetching all saved pages or by creating a new one.
     */
    registerPage: function(page, pages){
        //TODO update navigation dropdown

    }
});

/**
 * Add page modal interface
 *
 * @type {View}
 */
DH.AddPageModalView = DH.ModalView.extend({
    form: null, //page form element

    initialize: function(){
        DH.ModalView.prototype.initialize.call(this);

        this.render();
    },

    render: function(){
        var FieldTitle;
        var FieldSlug;
        var FieldDescription;

        this.form = new DH.FormView();
        this.form.$el = $(Mustache.render(Templates.get('add-page-form'), this.data));
        this.form.on('submit', function(){
            this.createPage({
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
        this.form.register(FieldTitle, this.form.$('.j-field-title'));
        this.form.register(FieldSlug, this.form.$('.j-field-slug'));
        this.form.register(FieldDescription, this.form.$('.j-field-description'));

        //remember to bind click handler to this object
        this.form.$('.j-lnk-cancel').click(function(){
            this.close();
        }.bind(this));
        //remember to bind click handler to this object
        this.form.$('.j-btn-add').click(function(){
            this.form.submit();
        }.bind(this));

        DH.ModalView.prototype.render.call(this); //render the generic modal we inherited

        this.setTitle('Add a Page');

        this._$content.append(this.form.$el); //place the form
    },

    createPage: function(data){
        //TODO figure out better solution
        DH.App.createPage(data);
    }
});

/**
 * Page representation, controls blocks collection, linked to page model
 *
 * @type {View}
 */
DH.PageView = Backbone.View.extend({
    model: null, //page model
    blocks: null, //collection of page blocks
    form: null, //page edit form element //TODO add page editing

    events: {
        'click .add-block': 'addBlock'
    },

    initialize: function(model){
        this.model = model;
        //this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);

        this.blocks = new DH.BlockCollection();
        this.blocks.setUrl(this.model.get('id'));
        this.blocks.on('reset', this.processLoadedBlocks, this);
        //this.blocks.on('add', this.registerBlock, this);
        this.blocks.fetch();
    },

    render: function(){
        this.$el = $(Mustache.render(Templates.get('page'), this.model.attributes));
        this.delegateEvents();
    },

    remove: function(){

    },

    addBlock: function(){
        var newBlockModel;
        var newBlockView;

        newBlockModel = new DH.BlockModel({
            pageId: this.model.get('dbid')
        });
        this.blocks.add(newBlockModel);

        newBlockView = new DH.BlockView(newBlockModel);
        newBlockView.render();
        this.$('.blocks').append(newBlockView.$el);

        newBlockView.edit();
    },

    processLoadedBlocks: function(){
        this.blocks.each(function(model){
            var view;

            view = new DH.BlockView(model);
            view.render();
            this.$('.blocks').append(view.$el);
        });
    }
});


/**
 * Block representation, controls items collection
 *
 * @type {View}
 */
DH.BlockView = Backbone.View.extend({
    model: null, //block model
    items: null, //collection of block items
    form: null, //block edit form element

    events: {
        'click .block-info .edit-link': 'edit',
        'click .block-info .cancel-link': 'cancel',
        'click .block-info .j-save-button': function(){
            this.form.submit();
        },
        'click .add-item': 'addItem'
    },

    initialize: function(model){
        this.model = model;

        this.model.on('sync', function(){



        }, this);
    },

    render: function(){
        this.$el = $(Mustache.render(Templates.get('block'), this.model.attributes));
        this.delegateEvents();

        this.form = new DH.FormView();
        this.form.$el = this.$('.block-info');
        this.form.on('submit', this.save, this);

        this.form.fieldTitle = new DH.InputView({
            sample: 'Enter block title',
            rules: {
                required: {
                    message: 'Please give block a title.'
                }
            }
        });
        this.form.fieldSlug = new DH.InputView({
            sample: 'Enter block url slug',
            rules: {
                required: {
                    message: 'Please provide the url slug for this block.'
                }
            }
        });
        this.form.fieldDescription = new DH.AreaView({
            sample: 'Enter block description'
        });

        this.form.fieldTitle.render();
        this.form.fieldSlug.render();
        this.form.fieldDescription.render();

        //register fields to the form
        this.form.register(this.form.fieldTitle, this.form.$('.j-block-title-filed'));
        this.form.register(this.form.fieldSlug, this.form.$('.j-block-url-filed'));
        this.form.register(this.form.fieldDescription, this.form.$('.j-block-description-filed'));

        //remember to bind click handler to this object
        this.form.$('.j-lnk-cancel').click(function(){
            this.close();
        }.bind(this));
        //remember to bind click handler to this object
        this.form.$('.j-btn-add').click(function(){
            this.form.submit();
        }.bind(this));
    },

    edit: function(){
        this.form.fieldTitle.val(this.model.get('title'));
        this.form.fieldSlug.val(this.model.get('id'));
        this.form.fieldDescription.val(this.model.get('description'));

        this.form.$el.addClass('edit');
    },

    cancel: function(){
        this.form.$el.removeClass('edit');

        //clean up if new block
        if(!this.model.get('dbid')){
            delete this.model;
            delete this.form;
            this.remove();
        }
    },

    save: function(){
        var data = {}; //edited info hash
        var onSave; //model save success callback
        var onFail; //model save error callback
        var btn = this.form.$('.j-save-button'); //button that triggered the saving

        onSave = function(){
            btn.removeClass('syncing');
        };
        onFail = function(){
            btn.removeClass('syncing');

            throw 'Server error while saving block';
        };

        data = {
            title: this.form.fieldTitle.val(),
            id: this.form.fieldSlug.val(),
            url: this.form.fieldSlug.val(),
            description: this.form.fieldDescription.val()
        };
        this.model.save(data, {
            success: onSave,
            error: onFail,
            wait: true
        });

        this.form.$el.removeClass('edit');
        btn.addClass('syncing');
    },

    addItem: function(){

    }
});