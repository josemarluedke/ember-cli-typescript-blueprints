'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerate = blueprintHelpers.emberGenerate;
const emberDestroy = blueprintHelpers.emberDestroy;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;
const setupPodConfig = blueprintHelpers.setupPodConfig;

const expectError = require('../helpers/expect-error');
const chai = require('ember-cli-blueprint-test-helpers/chai');
const expect = chai.expect;
const file = chai.file;
const fs = require('fs-extra');

const generateFakePackageManifest = require('../helpers/generate-fake-package-manifest');
const fixture = require('../helpers/fixture');

describe('Blueprint: route', function() {
  setupTestHooks(this);

  describe('in app', function() {
    beforeEach(function() {
      return emberNew().then(() => generateFakePackageManifest('ember-cli-qunit', '4.1.0'));
    });

    it('route foo', function() {
      return emberGenerateDestroy(['route', 'foo'], _file => {
        expect(_file('app/routes/foo.ts')).to.equal(fixture('route/route.ts'));

        expect(_file('app/templates/foo.hbs')).to.equal('{{outlet}}');

        expect(_file('tests/unit/routes/foo-test.ts')).to.equal(fixture('route-test/default.ts'));

        expect(file('app/router.js')).to.contain("this.route('foo')");
      }).then(() => {
        expect(file('app/router.js')).to.not.contain("this.route('foo')");
      });
    });

    it('route foo --skip-router', function() {
      return emberGenerateDestroy(['route', 'foo', '--skip-router'], _file => {
        expect(_file('app/routes/foo.ts')).to.exist;
        expect(_file('app/templates/foo.hbs')).to.exist;
        expect(_file('tests/unit/routes/foo-test.ts')).to.exist;
        expect(file('app/router.js')).to.not.contain("this.route('foo')");
      }).then(() => {
        expect(file('app/router.js')).to.not.contain("this.route('foo')");
      });
    });

    it('route foo --path=:foo_id/show', function() {
      return emberGenerateDestroy(['route', 'foo', '--path=:foo_id/show'], _file => {
        expect(_file('app/routes/foo.ts')).to.equal(fixture('route/route.ts'));

        expect(_file('app/templates/foo.hbs')).to.equal('{{outlet}}');

        expect(_file('tests/unit/routes/foo-test.ts')).to.equal(fixture('route-test/default.ts'));

        expect(file('app/router.js'))
          .to.contain("this.route('foo', {")
          .to.contain("path: ':foo_id/show'")
          .to.contain('});');
      }).then(() => {
        expect(file('app/router.js'))
          .to.not.contain("this.route('foo'")
          .to.not.contain("path: ':foo_id/show'");
      });
    });

    it('route parent/child --reset-namespace', function() {
      return emberGenerateDestroy(['route', 'parent/child', '--reset-namespace'], _file => {
        expect(_file('app/routes/child.ts')).to.equal(fixture('route/route-child.ts'));

        expect(_file('app/templates/child.hbs')).to.equal('{{outlet}}');

        expect(_file('tests/unit/routes/child-test.ts')).to.equal(
          fixture('route-test/default-child.ts')
        );

        expect(file('app/router.js'))
          .to.contain("this.route('parent', {")
          .to.contain("this.route('child', {")
          .to.contain('resetNamespace: true')
          .to.contain('});');
      });
    });

    it('route parent/child --reset-namespace --pod', function() {
      return emberGenerateDestroy(
        ['route', 'parent/child', '--reset-namespace', '--pod'],
        _file => {
          expect(_file('app/child/route.ts')).to.equal(fixture('route/route-child.ts'));

          expect(_file('app/child/template.hbs')).to.equal('{{outlet}}');

          expect(_file('tests/unit/child/route-test.ts')).to.equal(
            fixture('route-test/default-child.ts')
          );

          expect(file('app/router.js'))
            .to.contain("this.route('parent', {")
            .to.contain("this.route('child', {")
            .to.contain('resetNamespace: true')
            .to.contain('});');
        }
      );
    });

    it('route index', function() {
      return emberGenerateDestroy(['route', 'index'], _file => {
        expect(_file('app/routes/index.ts')).to.exist;
        expect(_file('app/templates/index.hbs')).to.exist;
        expect(_file('tests/unit/routes/index-test.ts')).to.exist;
        expect(file('app/router.js')).to.not.contain("this.route('index')");
      }).then(() => {
        expect(file('app/router.js')).to.not.contain("this.route('index')");
      });
    });

    it('route application', function() {
      fs.removeSync('app/templates/application.hbs');
      return emberGenerate(['route', 'application']).then(() => {
        expect(file('app/router.js')).to.not.contain("this.route('application')");
      });
    });

    it('route basic', function() {
      return emberGenerateDestroy(['route', 'basic'], _file => {
        expect(_file('app/routes/basic.ts')).to.exist;
        expect(file('app/router.js')).to.not.contain("this.route('basic')");
      }).then(() => {
        expect(file('app/router.js')).to.not.contain("this.route('basic')");
      });
    });

    it('route foo --pod', function() {
      return emberGenerateDestroy(['route', 'foo', '--pod'], _file => {
        expect(_file('app/foo/route.ts')).to.equal(fixture('route/route.ts'));

        expect(_file('app/foo/template.hbs')).to.equal('{{outlet}}');

        expect(_file('tests/unit/foo/route-test.ts')).to.equal(fixture('route-test/default.ts'));

        expect(file('app/router.js')).to.contain("this.route('foo')");
      }).then(() => {
        expect(file('app/router.js')).to.not.contain("this.route('foo')");
      });
    });

    it('route foo --pod with --path', function() {
      return emberGenerate(['route', 'foo', '--pod', '--path=:foo_id/show'])
        .then(() =>
          expect(file('app/router.js'))
            .to.contain("this.route('foo', {")
            .to.contain("path: ':foo_id/show'")
            .to.contain('});')
        )

        .then(() => emberDestroy(['route', 'foo', '--pod', '--path=:foo_id/show']))
        .then(() =>
          expect(file('app/router.js'))
            .to.not.contain("this.route('foo', {")
            .to.not.contain("path: ':foo_id/show'")
        );
    });

    it('route index --pod', function() {
      return emberGenerate(['route', 'index', '--pod']).then(() =>
        expect(file('app/router.js')).to.not.contain("this.route('index')")
      );
    });

    it('route application --pod', function() {
      return emberGenerate(['route', 'application', '--pod'])
        .then(() => expect(file('app/application/route.ts')).to.exist)
        .then(() => expect(file('app/application/template.hbs')).to.exist)
        .then(() => expect(file('app/router.js')).to.not.contain("this.route('application')"));
    });

    it('route basic --pod', function() {
      return emberGenerateDestroy(['route', 'basic', '--pod'], _file => {
        expect(_file('app/basic/route.ts')).to.exist;
        expect(file('app/router.js')).to.not.contain("this.route('index')");
      });
    });

    describe('with podModulePrefix', function() {
      beforeEach(function() {
        setupPodConfig({ podModulePrefix: true });
      });

      it('route foo --pod', function() {
        return emberGenerateDestroy(['route', 'foo', '--pod'], _file => {
          expect(_file('app/pods/foo/route.ts')).to.equal(fixture('route/route.ts'));

          expect(_file('app/pods/foo/template.hbs')).to.equal('{{outlet}}');

          expect(_file('tests/unit/pods/foo/route-test.ts')).to.equal(
            fixture('route-test/default.ts')
          );

          expect(file('app/router.js')).to.contain("this.route('foo')");
        }).then(() => {
          expect(file('app/router.js')).to.not.contain("this.route('foo')");
        });
      });
    });
  });

  describe('in addon', function() {
    beforeEach(function() {
      return emberNew({ target: 'addon' }).then(() =>
        generateFakePackageManifest('ember-cli-qunit', '4.1.0')
      );
    });

    it('route foo', function() {
      return emberGenerateDestroy(['route', 'foo'], _file => {
        expect(_file('addon/routes/foo.ts')).to.equal(fixture('route/route.ts'));

        expect(_file('addon/templates/foo.hbs')).to.equal('{{outlet}}');

        expect(_file('app/routes/foo.js')).to.contain(
          "export { default } from 'my-addon/routes/foo';"
        );

        expect(_file('app/templates/foo.js')).to.contain(
          "export { default } from 'my-addon/templates/foo';"
        );

        expect(_file('tests/unit/routes/foo-test.ts')).to.equal(fixture('route-test/default.ts'));

        expect(file('tests/dummy/app/router.js')).to.not.contain("this.route('foo')");
      }).then(() => {
        expect(file('tests/dummy/app/router.js')).to.not.contain("this.route('foo')");
      });
    });

    it('route foo/bar', function() {
      return emberGenerateDestroy(['route', 'foo/bar'], _file => {
        expect(_file('addon/routes/foo/bar.ts')).to.equal(fixture('route/route-nested.ts'));

        expect(_file('addon/templates/foo/bar.hbs')).to.equal('{{outlet}}');

        expect(_file('app/routes/foo/bar.js')).to.contain(
          "export { default } from 'my-addon/routes/foo/bar';"
        );

        expect(_file('app/templates/foo/bar.js')).to.contain(
          "export { default } from 'my-addon/templates/foo/bar';"
        );

        expect(_file('tests/unit/routes/foo/bar-test.ts')).to.equal(
          fixture('route-test/default-nested.ts')
        );

        expect(file('tests/dummy/app/router.js')).to.not.contain("this.route('bar')");
      }).then(() => {
        expect(file('tests/dummy/app/router.js')).to.not.contain("this.route('bar')");
      });
    });

    it('route foo --dummy', function() {
      return emberGenerateDestroy(['route', 'foo', '--dummy'], _file => {
        expect(_file('tests/dummy/app/routes/foo.ts')).to.equal(fixture('route/route.ts'));

        expect(_file('tests/dummy/app/templates/foo.hbs')).to.equal('{{outlet}}');

        expect(_file('app/routes/foo.js')).to.not.exist;
        expect(_file('app/templates/foo.hbs')).to.not.exist;
        expect(_file('tests/unit/routes/foo-test.ts')).to.not.exist;

        expect(file('tests/dummy/app/router.js')).to.contain("this.route('foo')");
      }).then(() => {
        expect(file('tests/dummy/app/router.js')).to.not.contain("this.route('foo')");
      });
    });

    it('route foo/bar --dummy', function() {
      return emberGenerateDestroy(['route', 'foo/bar', '--dummy'], _file => {
        expect(_file('tests/dummy/app/routes/foo/bar.ts')).to.equal(
          fixture('route/route-nested.ts')
        );

        expect(_file('tests/dummy/app/templates/foo/bar.hbs')).to.equal('{{outlet}}');

        expect(_file('app/routes/foo/bar.js')).to.not.exist;
        expect(_file('app/templates/foo/bar.hbs')).to.not.exist;
        expect(_file('tests/unit/routes/foo/bar-test.ts')).to.not.exist;

        expect(file('tests/dummy/app/router.js'))
          .to.contain("this.route('foo', function() {")
          .to.contain("this.route('bar')");
      }).then(() => {
        expect(file('tests/dummy/app/router.js')).to.not.contain("this.route('bar')");
      });
    });

    it('route foo --pod', function() {
      return emberGenerateDestroy(['route', 'foo', '--pod'], _file => {
        expect(_file('addon/foo/route.ts')).to.equal(fixture('route/route.ts'));

        expect(_file('addon/foo/template.hbs')).to.equal('{{outlet}}');

        expect(_file('app/foo/route.js')).to.contain(
          "export { default } from 'my-addon/foo/route';"
        );

        expect(_file('app/foo/template.js')).to.contain(
          "export { default } from 'my-addon/foo/template';"
        );

        expect(_file('tests/unit/foo/route-test.ts')).to.equal(fixture('route-test/default.ts'));
      });
    });
  });

  describe('in in-repo-addon', function() {
    beforeEach(function() {
      return emberNew({ target: 'in-repo-addon' }).then(() =>
        generateFakePackageManifest('ember-cli-qunit', '4.1.0')
      );
    });

    it('route foo --in-repo-addon=my-addon', function() {
      return emberGenerateDestroy(['route', 'foo', '--in-repo-addon=my-addon'], _file => {
        expect(_file('lib/my-addon/addon/routes/foo.ts')).to.equal(fixture('route/route.ts'));

        expect(_file('lib/my-addon/addon/templates/foo.hbs')).to.equal('{{outlet}}');

        expect(_file('lib/my-addon/app/routes/foo.js')).to.contain(
          "export { default } from 'my-addon/routes/foo';"
        );

        expect(_file('lib/my-addon/app/templates/foo.js')).to.contain(
          "export { default } from 'my-addon/templates/foo';"
        );

        expect(_file('tests/unit/routes/foo-test.ts')).to.equal(fixture('route-test/default.ts'));
      });
    });

    it('route foo/bar --in-repo-addon=my-addon', function() {
      return emberGenerateDestroy(['route', 'foo/bar', '--in-repo-addon=my-addon'], _file => {
        expect(_file('lib/my-addon/addon/routes/foo/bar.ts')).to.equal(
          fixture('route/route-nested.ts')
        );

        expect(_file('lib/my-addon/addon/templates/foo/bar.hbs')).to.equal('{{outlet}}');

        expect(_file('lib/my-addon/app/routes/foo/bar.js')).to.contain(
          "export { default } from 'my-addon/routes/foo/bar';"
        );

        expect(_file('lib/my-addon/app/templates/foo/bar.js')).to.contain(
          "export { default } from 'my-addon/templates/foo/bar';"
        );

        expect(_file('tests/unit/routes/foo/bar-test.ts')).to.equal(
          fixture('route-test/default-nested.ts')
        );
      });
    });
  });
});
