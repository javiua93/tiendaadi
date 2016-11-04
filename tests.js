var s = require('./index');
var supertest = require('supertest');


describe('pruebas de modelos', function(){
var token;
var tokenPepe;
var modelos;
	before(function(done) {
		supertest(s)
            .post('/api/doLogin')
            .send({login: 'admin',pass:'admin'})
            .end(function(err, res) {
            	
            	token = res.text;
            	done();
            	
            })
         
	});

	before(function(done) {
		supertest(s)
            .post('/api/doLogin')
            .send({login: 'pepe',pass:'123'})
            .end(function(err, res) {
            	
            	tokenPepe = res.text;
            	done();
            	
            })
         
	});
	before(function(done) {
		supertest(s)
            .get('/api/modelos')
            .end(function(err, res) {
            	var vector=res.body;
            	modelos=vector.length;
            	//console.log(modelos);
            	done();
            	
            })
         
	});

    it('/api/modelos devuelve siempre 200', function(done){

        supertest(s)
            .get('/api/modelos')
            .expect(200, done)

           
    });
    it('/api/modelos/:id con id inexistente devuelve 404', function(done){

        supertest(s)
            .get('/api/modelos/2555')
            .expect(404, done)

           
    });
    it('Prueba de delete correcto en modelos', function(done){
    	
        supertest(s)
            .del('/api/modelos/'+modelos)
            .send({nombre: 'test',descripcion:'modelo para test', codigo:'T1', precio:12})
            .set('authorization', 'Bearer '+ token)
            .expect(200, done);
    });
    it('Prueba post correcto en modelos', function(done){
    	
        supertest(s)
            .post('/api/modelos')
            .send({nombre: 'test',descripcion:'modelo para test', codigo:'T1', precio:12})
            .set('authorization', 'Bearer '+ token)
            .expect(201, done);
    });
     it('Prueba post sin permisos en modelos', function(done){
    	
        supertest(s)
            .post('/api/modelos')
            .send({nombre: 'test',descripcion:'modelo para test', codigo:'T1', precio:12})
            .set('authorization', 'Bearer '+tokenPepe)
            .expect(403, done);
    });
      it('Prueba put con campos inadecuados devuelve 400', function(done){
    	
        supertest(s)
            .put('/api/modelos/2')
            .send({n: 'test',descripcion:'modelo para test', cod:'T1', precio:12})
            .set('authorization', 'Bearer '+token)
            .expect(400, done);
    });

});

describe('pruebas de usuarios', function(){

	var token;

	before(function(done) {
		supertest(s)
            .post('/api/doLogin')
            .send({login: 'admin',pass:'admin'})
            .end(function(err, res) {
            	
            	token = res.text;
            	done();
            	
            })
         
	});

	it('Prueba de login correcto', function(done){
        supertest(s)
            .post('/api/doLogin')
            .send({login: 'pepe',pass:'123'})
            .expect(200, done);
    });
    it('Prueba de login incorrecto', function(done){
        supertest(s)
            .post('/api/doLogin')
            .send({login: 'pepe',pass:'666'})
            .expect(401, done);
    });
    it('Prueba de registro incorrecto, con usuario ya registrado', function(done){
        supertest(s)
            .post('/api/registro')
            .send({login: 'pepe',pass:'666'})
            .expect(401, done);
    });
    it('Prueba get usuarios por admin(correcto)', function(done){
        supertest(s)
            .get('/api/usuarios')
            .set('authorization', 'Bearer '+token)
            .expect(200, done);
    });

})

describe('Pruebas de tallas', function(){
	before(function(done) {
		supertest(s)
            .post('/api/doLogin')
            .send({login: 'admin',pass:'admin'})
            .end(function(err, res) {
            	
            	token = res.text;
            	done();
            	
            })
         
	});
	it('Prueba get tallas', function(done){
        supertest(s)
            .get('/api/modelos/2/tallas')
            .expect(200, done);
    });
    it('Prueba post numero repetido en tallas', function(done){
        supertest(s)
            .post('/api/modelos/2/tallas')
            .send({numero: 37,cantidad:2})
            .set('authorization', 'Bearer '+ token)
            .expect(401, done);
    });
    it('Prueba put correcto en tallas', function(done){
        supertest(s)
            .put('/api/modelos/2/tallas/1')
            .send({cantidad:6})
            .set('authorization', 'Bearer '+ token)
            .expect(200, done);
    });

	})