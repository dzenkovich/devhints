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
        this.set('id', data.url);
    }
});

/**
 * Collection of pages, utility model to help creating navigation between pages and DB sync calls
 *
 * @type {Collection}
 */
DH.PageCollection = Backbone.Collection.extend({
    url: 'sync/page',
    model: DH.PageModel,

    getNames: function(){

    },

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
var Block = Backbone.Model.extend({
    attributes: {
        title: '', //required, the block title
        url: '' //required, the url segment to bring focus to this block on page load
    },
    items: [], //optional, collection of item models

    change: function(){

    }
});

/**
 * Item model represents the hint or knowledge piece
 *
 * @type {*}
 */
var Item = Backbone.Model.extend({
    attributes: {
        title: '', //required, the block title
        url: '', //required, the url segment to bring focus to this item on page load
        content: '' //required the description of the hint
    },

    change: function(){

    }
});