
require('nitro')(function (nitro) {

  var file = nitro.file;

  nitro.task('assets', function () {

    nitro.dir('assets').copy('public/assets');

    nitro.file.copy('humans.txt', 'public/humans.txt');

  });

  nitro.task('sass', function (target) {

    var dev = target === 'dev';

    nitro.dir('styles').load('{,**/}*.{scss,sass}').process('sass', {
      includePaths: [
        'node_modules'
      ],
      sourceComments: dev,
      autoprefix: true
    }).write('public/css');

  });

  nitro.task('templates', function (target) {

    var path = require('path'),
        template = nitro.template,
        layout = file.read('templates/layout.html'),
        renderPage = template( file.read('templates/layout.html') ),
        marked = require('marked'),
        scope = nitro.tools.scope({
          dev: target === 'dev',
          month: function (month) {
            return '<span class="month" data-long="' + month + '" data-short="' + month.substr(0, 3) + '"></span>';
          }
        }),
        YAML = nitro.require('yaml-js');

    nitro.dir('templates').load(['{,**/}*.html', 'layout.html']).each(function (f) {
      template.put( f.path, f.src );
    });

    nitro.dir('templates/partials').load('{,**/}*.html').each(function (f) {
      var pathParts = f.path.split('/'),
          filename = pathParts.pop();

      pathParts.push( filename.replace(/^_|\.html$/g, '') );

      template.put( pathParts.join('/'), f.src );
    });

    var renderLang = function (lang, asRoot) {

      var i18n = YAML.load( file.read('i18n/' + lang + '.yml') ),
          pageScope = scope.new({
            lang: lang,
            text: i18n,
            altLang: lang === 'es' ? 'en' : 'es',
            markdown: marked,
            baseHref: asRoot ? '/' : ( '/' + lang + '/' )
          });

      file.write(
        asRoot ? 'public/index.html' : ('public/' + lang + '/index.html'),
        template.get('layout.html')( pageScope.new({
          altLangHref: lang === 'es' ? '/' : '/es/',
          article: template.get('index.html')(pageScope),
          articleClasses: 'page-index'
        }) )
      );

      nitro.dir('templates/pages').expand('{,**/}*.html').forEach(function (page) {

        file.write(
          'public/' + ( asRoot ? '' : ( lang + '/' ) ) + page.replace(/\.html$/, '/index.html'),
          template.get('layout.html')( pageScope.new({
            altLangHref: (lang === 'es' ? '/' : '/es/') + page.replace(/\.html$/, '/'),
            article: template.get('pages/' + page)(pageScope),
            articleClasses: 'page-' + page.replace(/\.html$/, '').split('/').join('-')
          }) )
        );

      });
    }

    renderLang('en', true);
    renderLang('en');
    renderLang('es');

  });

  nitro.task('cname', function () {
    nitro.file.write('public/CNAME', 'jesus.germade.es');
  });

  nitro.task('build', ['assets', 'sass', 'templates']);

  nitro.task('dev', ['assets', 'sass', 'templates'], function () {

    nitro.watch('assets', ['assets']);

    nitro.watch('styles')
      .when('{,**/}*.{scss,sass}', 'sass:dev');

    nitro.watch('templates')
      .when('{,**/}*.html', 'templates:dev');

    nitro.watch('i18n')
      .when('{,**/}*', 'templates:dev');

    // nitro.require('livereload').createServer().watch(['public']);

  });

  nitro.task('live', ['dev'], function () {

    nitro.server({
      root: 'public',
      openInBrowser: true,
      livereload: 'public'
    });

  });

}).run();
