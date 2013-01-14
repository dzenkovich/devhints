/**
 * UI Blocks data retrival and saving logic
 *
 * @author Denis Zenkovich
 */
var DH = DH || {}; //ensure namespace

/**
 * Page model represents a single page filled with various blocks of information
 * Pages can be created added from the top bar and navigated at the topbar menu
 *
 * @type {Model}
 */
DH.PageModel = Backbone.Model.extend({
    attributes: {
        title: '', //required, the page title
        url: '' //required, the url segment page will open at
    },
    blocks: [], //optional, collection of block models

    initialize: function(data){
        this.blocks = new DH.BlockCollection();
        this.blocks.setUrl(this.url());
    }
});

/**
 * Collection of pages, utility model to help creating navigation between pages and DB sync calls
 *
 * @type {Collection}
 */
DH.PageCollection = Backbone.Collection.extend({
    url: 'sync/',
    model: DH.PageModel,

    findByUrl: function(url){
        return this.where({url: url}).shift();
    }
});

/**
 * Block model represent the section containing various reference and knowledge items
 * You add blocks to the page
 *
 * @type {Model}
 */
DH.BlockModel = Backbone.Model.extend({
    attributes: {
        title: '', //required, the block title
        url: '' //required, the url segment to bring focus to this block on page load
    },
    items: [], //optional, collection of item models

    initialize: function(data){
        this.items = new DH.ItemCollection();
        this.items.setUrl(this.url());
    }
});

/**
 * Collection of blocks, model to help page model in organizing it's blocks
 *
 * @type {Collection}
 */
DH.BlockCollection = Backbone.Collection.extend({
    url: null,
    model: DH.BlockModel,

    setUrl: function(pageUrl){ //TODO add url validation
        this.url = pageUrl;
    },

    findByUrl: function(url){
        return this.where({url: url}).shift();
    }
});

/**
 * Item model represents the hint or knowledge piece
 *
 * @type {*}
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
 * @type {Collection}
 */
DH.ItemCollection = Backbone.Collection.extend({
    url: null,
    model: DH.BlockModel,

    setUrl: function(blockUrl){ //TODO add url validation
        this.url = blockUrl;
    },

    findByUrl: function(url){
        return this.where({url: url}).shift();
    }
});