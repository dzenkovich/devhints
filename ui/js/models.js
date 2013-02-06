/**
 * @fileOverview Developer Hints Models section, file containing all the model objects for the devhints project
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
 * Page model represents a single page filled with various blocks of information
 * Pages can be created added from the top bar and navigated at the topbar menu
 *
 * @param {Object} data Initial model attributes
 * @type {Model}
 */
DH.PageModel = Backbone.Model.extend({
    attributes: {
        title: '', //required, the page title
        url: '' //required, the url segment page will open at
    },
    blocks: [], //optional, collection of block models

    /**
     * @constructs
     */
    initialize: function(data){
        this.blocks = new DH.BlockCollection();
        this.blocks.setUrl(this.url());
    }
});

/**
 * Collection of pages, utility model to help creating navigation between pages and DB sync calls
 *
 * @type {Object}
 */
DH.PageCollection = Backbone.Collection.extend({
    url: 'sync/',
    model: DH.PageModel,

    /**
     * Find model in a collection having the url specified
     *
     * @param {String} url
     * @return {Object} found Model
     */
    findByUrl: function(url){
        return this.where({url: url}).shift();
    }
});

/**
 * Block model represent the section containing various reference and knowledge items
 * You add blocks to the page
 *
 * @param {Object} data Initial model attributes
 * @type {Object} found Model
 */
DH.BlockModel = Backbone.Model.extend({
    attributes: {
        title: '', //required, the block title
        url: '' //required, the url segment to bring focus to this block on page load
    },
    items: [], //optional, collection of item models

    /**
     * @constructs
     */
    initialize: function(data){
        this.items = new DH.ItemCollection();
        this.items.setUrl(this.url());
    }
});

/**
 * Collection of blocks, model to help page model in organizing it's blocks
 *
 * @type {Object}
 */
DH.BlockCollection = Backbone.Collection.extend({
    url: null,
    model: DH.BlockModel,

    /**
     * Update model url
     *
     * @param {String} pageUrl
     */
    setUrl: function(pageUrl){ //TODO add url validation
        this.url = pageUrl;
    },

    /**
     * Find model in a collection having the url specified
     *
     * @param {String} url
     * @return {Object} found Model
     */
    findByUrl: function(url){
        return this.where({url: url}).shift();
    }
});

/**
 * Item model represents the hint or knowledge piece
 *
 * @type {Object}
 */
DH.ItemModel = Backbone.Model.extend({
    attributes: {
        title: '', //required, the block title
        content: '' //required the description of the hint
    }
});

/**
 * Collection of items, model to help block model in organizing it's items
 *
 * @type {Object}
 */
DH.ItemCollection = Backbone.Collection.extend({
    url: null,
    model: DH.BlockModel,

    /**
     * Update model url
     *
     * @param {String} blockUrl
     */
    setUrl: function(blockUrl){ //TODO add url validation
        this.url = blockUrl;
    },

    /**
     * Find model in a collection having the url specified
     *
     * @param {String} url
     * @return {Object} found Model
     */
    findByUrl: function(url){
        return this.where({url: url}).shift();
    }
});