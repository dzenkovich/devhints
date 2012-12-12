/**
 * Various elements, primitive construction blocks like form fields, dropdowns and etc.
 *
 * @author Denis Zenkovich
 */
var DH = DH || {}; //ensure namespace

/**
 * Generic modal window
 *
 * @type {*}
 */
DH.ModalView = Backbone.View.extend({
    tagName: 'div',
    data: {}, //attributes to pass to tpl
    _$content: null, //JQ modal content element
    _$header: null, //JQ modal header element

    _position: function(){
        var Size;
        var Top;
        var Left;

        this.$el.show();
        Size = {
            width: this.$el.width(),
            height: this.$el.height(),
            pageWidth: $(window).width(),
            pageHeight: $(window).height()
        };
        this.$el.hide();
        Top = Math.round((Size.pageHeight - Size.height)/2);
        Top = Top < 0 ? 0 : Top;
        Left = Math.round((Size.pageWidth - Size.width)/2);
        this.$el.css({
            top: Top,
            left: Left
        });
    },

    initialize: function(){
        //create page overlay if none exist yet, use it as a static property through all modals
        if(!DH.ModalView._$cover){
            DH.ModalView._$cover = $('<div class="cover"></div>').hide().appendTo(document.body);
        }
    },

    render: function(){
        this.$el = $(Mustache.render(Templates.get('modal'), this.data));
        this._$content = this.$('.content');
        this._$header = this.$('.header');

        this.$el.appendTo(document.body);
    },

    setTitle: function(title){
        this.$('.title').html(title);
    },

    open: function(){
        this._position();
        this.$el.show();
        DH.ModalView._$cover.show();
    },

    close: function(){
        this.$el.hide();
        DH.ModalView._$cover.hide();
    }
});

DH.FormView = Backbone.View.extend({
    tagName: 'form',
    _elements: [], //array of all form elements assigned

    events: {
        'keypress input': function(e){
            if(e.keyCode == 13 && $(e.srcElement).is('input')){
                this.submit();
            }
        }
    },

    submit: function(){
        if(this.validate()) this.trigger('submit');
    },

    register: function(Field, ReplaceElement){
        if(ReplaceElement){
            ReplaceElement.replaceWith(Field.$el);
            this.delegateEvents();
        }
        this._elements.push(Field);
    },

    validate: function(){
        var i = 0;
        var errors = 0;

        for(; i<this._elements.length; i++){
            if(!this._elements[i].validate()) errors++;
        }
        return errors === 0;
    }
});
DH.FormView.checks = {
    required: {
        validator: function(val){
            return $.trim(val) != '';
        }
    }
};

/**
 * Common functionality of the form element, every real element inherits this object
 *
 * @type {Constructor Function}
 */
DH.ElementView = Backbone.View.extend({
    checks: [], //list of validation checks assigned
    _$error: null, //error container element
    _lastVal: null, //last known value of the element

    initialize: function(){
        if(this.options.rules) this.setRules(this.options.rules);
    },

    //interface method
    var: function(){
        return null;
    },

    focus: function(){
        this.$el.addClass('focus');
    },

    blur: function(){
        this.$el.removeClass('focus');
        this.validate();
        this._lastVal = this.val();
    },

    change: function(){
        var curVal = this.val();

        if(this._lastVal != curVal){
            this.clearError();
        }
    },

    setError: function(message){
        if(!this._$error){
            this._$error = this.$('.error');
        }
        this.$el.addClass('error');
        this._$error.html(message);
    },

    clearError: function(){
        this.$el.removeClass('error');
        if(this._$error) this._$error.html('');
    },

    setRules: function(rules){
        var i;

        for(i in rules){
            if(rules.hasOwnProperty(i) && DH.FormView.checks[i]){
                this.checks.push({
                    validator: DH.FormView.checks[i].validator,
                    message: rules[i].message
                })
            }
        }
    },

    validate: function(){
        var i=0;
        var val = this.val();

        for(; i<this.checks.length; i++){
            if(!this.checks[i].validator(val)){
                this.setError(this.checks[i].message);
                return false;
            }
        }
        return true;
    }
});

/**
 * Input field element
 *
 * @type {*}
 */
DH.InputView = DH.ElementView.extend({
    _$input: null, //html input

    events: {
        'focus input': 'focus',
        'blur input': 'blur',
        'keyup input': 'change'
    },

    initialize: function(){
        //reset checks list, or .prototype pointer would make it as a static across all children
        this.checks = [];
        DH.ElementView.prototype.initialize.call(this)
    },

    val: function(Str){
        if(Str != null){
            return this._$input.val(Str);
        }
        else{
            return this._$input.val();
        }
    },

    render: function(){
        this.$el = $(Mustache.render(Templates.get('input'), this.data));
        this.delegateEvents();
        this._$input = this.$('input');
    }
});

/**
 * Textarea field element
 *
 * @type {*}
 */
DH.AreaView = DH.ElementView.extend({
    checks: [], //reset checks list, or .prototype pointer would make it as a static across all children
    _$area: null, //html textarea

    events: {
        'focus textarea': 'focus',
        'blur textarea': 'blur',
        'keypress textarea': 'change'
    },

    initialize: function(){
        //reset checks list, or .prototype pointer would make it as a static across all children
        this.checks = [];
        DH.ElementView.prototype.initialize.call(this)
    },

    val: function(Str){
        if(Str != null){
            return this._$area.val(Str);
        }
        else{
            return this._$area.val();
        }
    },

    render: function(){
        this.$el = $(Mustache.render(Templates.get('area'), this.data));
        this.delegateEvents();
        this._$area = this.$('textarea');
    }
});