/*global QUnit, URL, sinon, $*/

(function () {

	var val = 'ggoforth@decipherinc.com seth@decipherinc.com dj@decipherinc.com carlos@decipherinc.com';
	var className = 'emails';
	var tagifyOpts = {
		removeCb: sinon.stub(),
		addCb: sinon.stub(),
		invalidCb: sinon.stub().callsArg(2),
		placeholder: 'Enter email and press ENTER to add recipient',
		inputValidation: /.+@.+\..+/,
		disallowInvalid: true,
		validationMessage: 'Please enter a proper email address',
		delimiter: ' ',
		buttonText: 'add email',
		showButton: false
	};

	QUnit.module('$.fn', {
		setup: function () {
			var $input = $('<input />', {'class': className, type: 'text'});
			$input.val(val);

			$('#qunit-fixture').append($input);
		},
		teardown: function () {}
	});

	QUnit.test('fixture creation', function () {
		QUnit.ok($('.' + className).length, 'There should be a fixture created with a class of .' + className);
	});

	QUnit.test('tagify', function () {
		var $input = $('.' + className);
		var $fixture = $('#qunit-fixture');
		var emailToAdd = 'amrit@decipherinc.com';
		var $tagifyInput;
		var newInputVal;

		QUnit.raises(function () {
			$input.tagify('foo');
		}, /foo/, 'Calling tagify with a string argument that has no api should raise an error.');

		$input.tagify(tagifyOpts);

		var inst = $input.data('tagify-instance');
		sinon.spy(inst, 'forceAdd');

		//assert we have a tagify-instance stored on the node
		QUnit.ok($input.data('tagify-instance'), 'We have the tagify-instance on the node.');

		$tagifyInput = $fixture.find('.tagify-input');

		//assert the inital setup works properly
		QUnit.equal($tagifyInput.length, 1, 'An input should be created that will handle adding new tags.');
		QUnit.ok(! $input.is(':visible'), 'The original input is hidden.');

		//assert there is a proper amount of tags created
		QUnit.equal($fixture.find('.tagify-tag').length, val.split(' ').length, '4 tagify-tags should be created.');
		QUnit.equal($input.val(), val, 'The starting value of the original input should remain unchanged.');
		QUnit.equal($tagifyInput.attr('placeholder'), tagifyOpts.placeholder, 'The proper placeholder is used for the tagify input.');

		//test adding an invalid tag
		$tagifyInput.val('foo');
		$tagifyInput.blur();
		QUnit.ok(tagifyOpts.invalidCb.called, 'the invalid callback is called.');
		QUnit.ok(inst.forceAdd.called, 'the force function is properly called when envoked from an invalidCb.');

		//test adding a new tag
		$tagifyInput.val($tagifyInput.val() + ' ' + emailToAdd);
		$tagifyInput.blur();
		newInputVal = $input.val();

		QUnit.ok(tagifyOpts.addCb.calledOnce, 'Should call the specified add callback.');
		QUnit.equal(newInputVal, val + ' ' + emailToAdd, 'The new value of the input should reflect the thing we just added.');
		QUnit.equal($fixture.find('.tagify-tag').length, $input.val().split(' ').length, '5 tagify-tags should be visible.');

		//test removing a tag
		$fixture.find('.tagify-remove').eq(0).click();

		newInputVal = $input.val();

		QUnit.equal($fixture.find('.tagify-tag').length, 4, '4 tags shold now be visible.');
		QUnit.equal($.inArray('ggoforth@decipherinc.com', newInputVal.split(' ')), -1, 'The proper thing has been removed from the original input.');
		QUnit.ok(tagifyOpts.removeCb.calledOnce, 'Should call the specified remove callback.');

		//remove everything and start again by simulating a pasted string
		$fixture.find('.tagify-remove').click();
		QUnit.equal(tagifyOpts.removeCb.callCount, 5, 'Should call the remove call back once for each tag that is removed.');
		QUnit.equal($fixture.find('.tagify-tag').length, 0, 'All tags should be removed from view.');
		QUnit.equal($fixture.find('.emails').val(), '', 'The original input should be empty now that everything has been removed');

		$tagifyInput.val(val);
		$tagifyInput.blur();

		QUnit.equal(tagifyOpts.addCb.callCount, 2, 'The add callback is called the proper amount of times.');
		QUnit.equal($fixture.find('.tagify-tag').length, val.split(' ').length, 'Pasting a space delimited string should properly parse the input when adding.');	

		//test reset method
		$input.tagify('reset');	

		QUnit.equal($fixture.find('.tagify-tag').length, 0, 'There should be no tags after a reset');
		QUnit.equal($tagifyInput.val(), '', 'The tagify input should be reset');
		QUnit.equal($input.val(), '', 'The original Tagify input should be reset');

		inst.forceAdd.restore();

        //test tags method when there are no tags
        $input.val('');
        $input.tagify(tagifyOpts);

        var tags = $input.tagify('tags');

        QUnit.equal(tags.length, 0, 'Tags should be empty');

        //test tags method when there are tags
        $input.val(val);
        $input.tagify(tagifyOpts);

        var tags = $input.tagify('tags');

        var values = val.split(' ');
        $.each(tags, function (idx, tagObject) {
            QUnit.equal(tagObject.tag, values[idx], 'The tag should have the correct value');
            QUnit.ok(!tagObject.invalid, 'The tag should be valid');
            QUnit.ok(!tagObject.selected, 'The tag should not be selected');
        });

        //test toggling does not work when disabled
        var $tag = $fixture.find('.tagify-tag').eq(0);

        $tag.click();
        var tag = $input.tagify('tags')[0];

        QUnit.ok(!$tag.hasClass('tagify-selected'), 'The tag should not have the selected class');
        QUnit.ok(!tag.selected, 'The tag should not be selected');

        //test toggling a tag on 
        $input.tagify($.extend(tagifyOpts, {toggle: true}));
		var $tag = $fixture.find('.tagify-tag').eq(0);
        
        $tag.click();
        var tag = $input.tagify('tags')[0];

        QUnit.ok($tag.hasClass('tagify-selected'), 'The tag should have the selected class');
        QUnit.ok(tag.selected, 'The tag should be selected');

        //test toggling a tag off
        var $tag = $fixture.find('.tagify-tag').eq(0);

        $tag.click();
        var tag = $input.tagify('tags')[0];

        QUnit.ok(!$tag.hasClass('tagify-selected'), 'The tag should not have the selected class');
        QUnit.ok(!tag.selected, 'The tag should not be selected');
	});

})();
