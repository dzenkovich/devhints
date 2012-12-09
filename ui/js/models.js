/**
 * UI Blocks data retrival and saving logic
 *
 * @author Denis Zenkovich
 */

/**
 * Page model represents a single page filled with various blocks of information
 * Pages can be created added from the top bar and navigated at the topbar menu
 *
 * @type {*}
 */
var Page = Backbone.Model.extend({
    title: '', //required, the page title
    urlSlug: '', //required, the url segment page will open at
    blocks: [], //optional, collection of block models

    change: function(){

    }
});

/**
 * Block model represent the section containing various reference and knowledge items
 * You add blocks to the page
 *
 * @type {*}
 */
var Block = Backbone.Model.extend({
    title: '', //required, the block title
    urlSlug: '', //required, the url segment to bring focus to this block on page load
    items: [], //optional, collection of item models

    change: function(){

    }
});

/**
 * Item model represents the iformation or knowledge piece
 *
 * @type {*}
 */
var Item = Backbone.Model.extend({
    name: '', //required, the block title
    urlSlug: '', //required, the url segment to bring focus to this item on page load

    change: function(){

    }
});