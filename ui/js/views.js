/**
 * @fileOverview Developer Hints Views section, file containing all the view objects for the devhints project
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
 * The main view of application deals with initial setup, page navigation, page creation/deletion and more
 *
 * @type {Object}
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

    /**
     * @constructs DH.AppView
     */
    initialize: function(){
        this.pages = new DH.PageCollection();
        this.pages.on('add', this.registerPage, this);
        this.pages.on('change:url', function(model){
            this.router.navigate(model.get('url'));
        }, this);
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

    /**
     * Create application router, assign routes and route actions
     */
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

    /**
     * Display the main application layout by using the loaded template, setup navigation between existing pages
     */
    render: function(){
        var resize; //window resize callback to ensure we don't get dumb whitespace in the footer
        var pagesList = []; //array of pages nav options
        var defaultText = null; //default dropdown text
        var pagesData = null; //data about existing pages for tpl rendering

        this.$el.html(Mustache.render(Templates.get('app'), {}));

        //prepare the list of possible page options for the header dropdown
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

        //make logo redirect to home page
        this.$('.logo').click(function(){
            this.router.navigate('', {trigger: true});
        }.bind(this));

        //create pages navigation dropdown
        this.navDropdown = new DH.DropdownView({options: pagesList});
        this.navDropdown.on('change', function(data){
            this.router.navigate(data.value, {trigger: true});
        }, this);
        this.navDropdown.render(defaultText);
        this.$('.nav-dropdown').append(this.navDropdown.$el);

        //prepare the info for the Home page template
        pagesData = [];
        this.pages.each(function(page){
            pagesData.push({
                title: page.get('title'),
                url: page.get('url'),
                description: page.get('description')
            });
        });
        //render the template and display the content
        $(Mustache.render(Templates.get('homepage'), {pages: pagesData}))
            .appendTo(this.$('.pages'))
            .find('.pages-list .item a').click(function(e){
                this.router.navigate($(e.target).attr('href'), {trigger: true});

                e.preventDefault();
        }.bind(this));

        this.setRouter();

        //update body height so that site displays at full screen
        resize = function(){
            this.$el.css('min-height', $(window).height());
        }.bind(this);
        $(window).resize(resize);
        resize();
    },

    /**
     * Display the add page modal window
     */
    openPageAddModal: function(){
        if(!this._addModal){
            this._addModal = new DH.AddPageModalView();
        }

        this._addModal.open();
    },

    /**
     * Load the page into the viewport by the given url slug
     *
     * @param {String} pageUrl url slug of the page to navigate to
     */
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

        //if page exists
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

    /**
     * Navigate to the home page, reset the pages dropdown
     */
    openHomepage: function(){
        this.$('.pages .page').hide();
        this.$('.pages').addClass('open-homepage');
        this.navDropdown.reset();
    },

    /**
     * Create new page and navigate so it gets displayed
     *
     * @param {Object} data Page data to be passed to model
     */
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
 * Add page modal window view entity
 *
 * @type {Object}
 */
DH.AddPageModalView = DH.ModalView.extend({
    form: null, //page form element

    /**
     * @constructs DH.AddPageModalView
     */
    initialize: function(){
        DH.ModalView.prototype.initialize.call(this);

        this.render();
    },

    /**
     * Create Add Page form and render into modal template
     */
    render: function(){
        var FieldTitle;
        var FieldSlug;
        var FieldDescription;

        //Create new form
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

        //Create title field
        FieldTitle = new DH.InputView({
            rules: {
                required: {
                    message: 'Please give page a title.'
                }
            }
        });
        //Create URL slug field
        FieldSlug = new DH.InputView({
            rules: {
                required: {
                    message: 'Please provide the url slug for this page.'
                }
            }
        });
        //Create page description field
        FieldDescription = new DH.AreaView();

        //prepare displays of the each field
        FieldTitle.render();
        FieldSlug.render();
        FieldDescription.render();

        //add fields to the form and link it with form for validation
        this.form.register(FieldTitle, this.form.$('.j-field-title'));
        this.form.register(FieldSlug, this.form.$('.j-field-slug'));
        this.form.register(FieldDescription, this.form.$('.j-field-description'));

        this.form.$('.j-lnk-cancel').click(function(){
            this.close();
        }.bind(this));
        this.form.$('.j-btn-add').click(function(){
            this.form.submit();
        }.bind(this));

        DH.ModalView.prototype.render.call(this); //render the generic modal we inherited

        this.setTitle('Add a Page');

        this._$content.append(this.form.$el); //place the form
    },

    /**
     * Toggle the page create method of the main App view
     *
     * @param {Object} data Page data
     */
    createPage: function(data){
        //TODO figure out better solution
        DH.App.createPage(data);
    }
});

/**
 * Page representation, controls blocks collection, linked to page model
 *
 * @param {Object} model Corresponding page Model object
 * @type {Object}
 */
DH.PageView = Backbone.View.extend({
    model: null, //page model
    form: null, //page edit form element

    events: {
        'click .page-info .edit-link': 'edit',
        'click .page-info .cancel-link': 'cancel',
        'click .page-info .j-save-button': function(){
            this.form.submit();
        },
        'click .add-block': 'addBlock'
    },

    /**
     * @constructs DH.PageView
     */
    initialize: function(model){
        this.model = model;
        //this.model.on('change', this.render, this);
        this.model.on('destroy', this.delete, this);
        this.model.on('sync', function(){
            this._updateInfo();
        }, this);

        this.model.blocks.on('reset', this.processLoadedBlocks, this);
        this.model.blocks.fetch();
    },

    /**
     * Create the display and edit views of the page and prepare them for future output and usage
     */
    render: function(){
        this.$el = $(Mustache.render(Templates.get('page'), this.model.attributes));
        this._updateInfo();
        this.delegateEvents();

        this.form = new DH.FormView();
        this.form.$el = this.$('.page-info');
        this.form.on('submit', this.save, this);

        this.form.fieldTitle = new DH.InputView({
            sample: 'Enter page title',
            rules: {
                required: {
                    message: 'Please give page a title.'
                }
            }
        });
        this.form.fieldSlug = new DH.InputView({
            sample: 'Enter page url slug',
            rules: {
                required: {
                    message: 'Please provide the url slug for this page.'
                }
            }
        });
        this.form.fieldDescription = new DH.AreaView({
            sample: 'Enter page description'
        });

        this.form.fieldTitle.render();
        this.form.fieldSlug.render();
        this.form.fieldDescription.render();

        //register fields to the form
        this.form.register(this.form.fieldTitle, this.form.$('.j-page-title-filed'));
        this.form.register(this.form.fieldSlug, this.form.$('.j-page-url-filed'));
        this.form.register(this.form.fieldDescription, this.form.$('.j-page-description-filed'));

        //remember to bind click handler to this object
        this.form.$('.j-lnk-cancel').click(function(){
            this.close();
        }.bind(this));
        //remember to bind click handler to this object
        this.form.$('.j-btn-add').click(function(){
            this.form.submit();
        }.bind(this));
    },

    /**
     * Update the page display view without re-rendering all of the template
     *
     * @private
     */
    _updateInfo: function(){
        this.$('.page-info-view').html(Mustache.render(Templates.get('page-info'), this.model.attributes));
    },

    /**
     * Toggle page into edit mode
     */
    edit: function(){
        this.form.fieldTitle.val(this.model.get('title'));
        this.form.fieldSlug.val(this.model.get('url'));
        this.form.fieldDescription.val(this.model.get('description'));

        this.form.$el.addClass('edit');
    },

    /**
     * Cancel editing and toggle back to view mode
     */
    cancel: function(){
        this.form.$el.removeClass('edit');
    },

    /**
     * Save page information (update related Model) and toggle to view mode
     */
    save: function(){
        var data; //edited info hash
        var onSave; //model save success callback
        var onFail; //model save error callback

        onSave = function(){
            this.$el.removeClass('syncing');
        }.bind(this);
        onFail = function(){
            this.$el.removeClass('syncing');

            throw 'Server error while saving block';
        }.bind(this);

        //prepare the data
        data = {
            title: this.form.fieldTitle.val(),
            url: this.form.fieldSlug.val(),
            description: this.form.fieldDescription.val()
        };
        //update the Page model
        this.model.save(data, {
            success: onSave,
            error: onFail,
            wait: true
        });

        this.form.$el.removeClass('edit');
        this.$el.addClass('syncing');
    },

    /**
     * Delete page from the application
     */
    delete: function(){
        if(this.model){
            this.model.destroy();
        }
        this.remove();
    },

    /**
     * Create new Block item, add it to the page and display it
     */
    addBlock: function(){
        var newBlockModel;
        var newBlockView;

        newBlockModel = new DH.BlockModel({
            pageId: this.model.get('id')
        });
        this.model.blocks.add(newBlockModel);

        newBlockView = new DH.BlockView(newBlockModel);
        newBlockView.render();
        this.$('.blocks').append(newBlockView.$el);

        newBlockView.edit();
    },

    /**
     * Render loaded page blocks and add them to the page display
     */
    processLoadedBlocks: function(){
        this.model.blocks.each(function(model){
            var view;

            view = new DH.BlockView(model);
            view.render();
            this.$('.blocks').append(view.$el);
        });
    }
});

/**
 * Block representation, controls items collection, linked to block model
 *
 * @param {Object} model Corresponding block model
 * @type {Object}
 */
DH.BlockView = Backbone.View.extend({
    model: null, //block model
    form: null, //block edit form element

    events: {
        'click .block-info .edit-link': 'edit',
        'click .block-info .delete-link': 'delete',
        'click .block-info .cancel-link': 'cancel',
        'click .block-info .j-save-button': function(){
            this.form.submit();
        },
        'click .add-item': 'addItem'
    },

    /**
     * @constructs DH.BlockView
     */
    initialize: function(model){
        this.model = model;

        this.model.on('sync', function(){
            this._updateInfo();
        }, this);

        this.model.items.on('reset', this.processLoadedItems, this);
        //this.blocks.on('add', this.registerBlock, this);
        this.model.items.fetch();
    },

    /**
     * Create the display and edit views of the block and prepare them for future output and usage
     */
    render: function(){
        this.$el = $(Mustache.render(Templates.get('block'), this.model.attributes));
        this._updateInfo();
        this.delegateEvents();

        //create form
        this.form = new DH.FormView();
        this.form.$el = this.$('.block-info');
        this.form.on('submit', this.save, this);

        //add title field
        this.form.fieldTitle = new DH.InputView({
            sample: 'Enter block title',
            rules: {
                required: {
                    message: 'Please give block a title.'
                }
            }
        });
        //add url slug field
        this.form.fieldSlug = new DH.InputView({
            sample: 'Enter block url slug',
            rules: {
                required: {
                    message: 'Please provide the url slug for this block.'
                }
            }
        });
        //add description field
        this.form.fieldDescription = new DH.AreaView({
            sample: 'Enter block description'
        });

        //prepare display of each field
        this.form.fieldTitle.render();
        this.form.fieldSlug.render();
        this.form.fieldDescription.render();

        //add fields to the form view and link to it's validation routine
        this.form.register(this.form.fieldTitle, this.form.$('.j-block-title-filed'));
        this.form.register(this.form.fieldSlug, this.form.$('.j-block-url-filed'));
        this.form.register(this.form.fieldDescription, this.form.$('.j-block-description-filed'));

        this.form.$('.j-lnk-cancel').click(function(){
            this.close();
        }.bind(this));
        this.form.$('.j-btn-add').click(function(){
            this.form.submit();
        }.bind(this));
    },

    /**
     * Update block view part without re-rendering all of the template
     * @private
     */
    _updateInfo: function(){
        this.$('.block-info-view').html(Mustache.render(Templates.get('block-info'), this.model.attributes));
    },

    /**
     * Toggle block edit mode
     */
    edit: function(){
        this.form.fieldTitle.val(this.model.get('title'));
        this.form.fieldSlug.val(this.model.get('url'));
        this.form.fieldDescription.val(this.model.get('description'));

        this.form.$el.addClass('edit');
    },

    /**
     * Cancel changes and toggle back view mode
     */
    cancel: function(){
        this.form.$el.removeClass('edit');

        //clean up if new block
        if(!this.model || !this.model.get('id')){
            delete this.model;
            delete this.form;
            this.delete();
        }
    },

    /**
     * Save changes (update model) and toggle view mode
     */
    save: function(){
        var data; //edited info hash
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

        //prepare data
        data = {
            title: this.form.fieldTitle.val(),
            url: this.form.fieldSlug.val(),
            description: this.form.fieldDescription.val()
        };
        //update model
        this.model.save(data, {
            success: onSave,
            error: onFail,
            wait: true
        });

        this.form.$el.removeClass('edit');
        btn.addClass('syncing');
    },

    /**
     * Delete the block from the application
     */
    delete: function(){
        if(this.model){
            this.model.destroy();
        }
        this.remove();
    },

    /**
     * Create new item, render it and add to block display
     */
    addItem: function(){
        var newItemModel;
        var newItemView;

        newItemModel = new DH.ItemModel({
            blockId: this.model.get('id')
        });
        this.model.items.add(newItemModel);

        newItemView = new DH.ItemView(newItemModel);
        newItemView.render();
        this.$('.items').append(newItemView.$el);

        newItemView.edit();
    },

    /**
     * Render loaded items and add them to block display
     */
    processLoadedItems: function(){
        this.model.items.each(function(model){
            var view;

            view = new DH.ItemView(model);
            view.render();
            this.$('.items').append(view.$el);
        });
    }
});

/**
 * Item representation, controls item information
 *
 * @param {Object} model Corresponding item model
 * @type {Object}
 */
DH.ItemView = Backbone.View.extend({
    model: null, //block model
    form: null, //block edit form element

    events: {
        'click .item-info .edit-link': 'edit',
        'click .item-info .delete-link': 'delete',
        'click .item-info .cancel-link': 'cancel',
        'click .item-info .j-save-button': function(){
            this.form.submit();
        }
    },

    /**
     * @constructs DH.ItemView
     */
    initialize: function(model){
        this.model = model;

        this.model.on('sync', function(){
            this._updateInfo();
        }, this);
    },

    /**
     * Create the display and edit views of the item and prepare them for future output and usage
     */
    render: function(){
        this.$el = $(Mustache.render(Templates.get('item'), this.model.attributes));
        this._updateInfo();
        this.delegateEvents();

        //create form
        this.form = new DH.FormView();
        this.form.$el = this.$('.item-info');
        this.form.on('submit', this.save, this);

        //add title field
        this.form.fieldTitle = new DH.InputView({
            sample: 'Enter item title',
            rules: {
                required: {
                    message: 'Please give item a title.'
                }
            }
        });
        //add description field
        this.form.fieldDescription = new DH.AreaView({
            sample: 'Enter item description'
        });

        //prepare display of each field
        this.form.fieldTitle.render();
        this.form.fieldDescription.render();

        //register fields to the form
        this.form.register(this.form.fieldTitle, this.form.$('.j-item-title-filed'));
        this.form.register(this.form.fieldDescription, this.form.$('.j-item-description-filed'));

        this.form.$('.j-lnk-cancel').click(function(){
            this.close();
        }.bind(this));
        this.form.$('.j-btn-add').click(function(){
            this.form.submit();
        }.bind(this));
    },

    /**
     * Update item view part without re-rendering all of the template
     *
     * @private
     */
    _updateInfo: function(){
        this.$('.item-info-view').html(Mustache.render(Templates.get('item-info'), this.model.attributes));
    },

    /**
     * toggle edit mode
     */
    edit: function(){
        this.form.fieldTitle.val(this.model.get('title'));
        this.form.fieldDescription.val(this.model.get('description'));

        this.form.$el.addClass('edit');
    },

    /**
     * cancel changes and toggle back to view mode
     */
    cancel: function(){
        this.form.$el.removeClass('edit');

        //clean up if new block
        if(!this.model || !this.model.get('id')){
            delete this.model;
            delete this.form;
            this.delete();
        }
    },

    /**
     * save changes (update model) and toggle view mode
     */
    save: function(){
        var data; //edited info hash
        var url; //url created from title
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

        //generate item url
        url = this.form.fieldTitle.val().toLowerCase().replace(/[^\w\s]/g, '').trim().replace(/\s/g, '-');

        //prepare data
        data = {
            title: this.form.fieldTitle.val(),
            url: url,
            description: this.form.fieldDescription.val()
        };
        //update model
        this.model.save(data, {
            success: onSave,
            error: onFail,
            wait: true
        });

        this.form.$el.removeClass('edit');
        btn.addClass('syncing');
    },

    /**
     * Delete item from the application
     */
    delete: function(){
        if(this.model){
            this.model.destroy();
        }
        this.remove();
    }

});