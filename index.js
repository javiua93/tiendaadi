var express = require('express')
var app = express()

//Para la utilidad body-parser
var bp = require('body-parser')
app.use(bp.json())

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./tienda.db');

var jwt = require('jwt-simple')
var moment = require('moment')

var secret = '123456'

app.get('/', function(pet, resp){
resp.send("Aplicación REST para tienda Online");
})

//Parte modelos

//Devuelve todos los modelos

app.get('/api/modelos', function(pet, resp){
	
	//console.log(pet.query.page)
		db.all("SELECT rowid as id, nombre as nombre, descripcion as descripcion, precio as precio, codigo as codigo FROM modelo", function(err, rows) {
			var pagina=pet.query.page;
			//Numero de items por página
			var n=4;
			if(pagina==undefined)
			{
			  resp.send(rows)
			} else
			{
			  resp.send(rows.splice(n*pagina,(n*pagina)+n))	
			}
			
	  });
		
	
	
	
})

//Devuelve modelo por id
app.get('/api/modelos/:id', function(pet,resp){
	var id = parseInt(pet.params.id)
	//console.log(id)
	if(isNaN(id)) {
		resp.status(400);
		resp.send("Fallo en la petición");
	} 
	else
	{
	db.all("SELECT rowid as id, nombre as nombre, descripcion as descripcion, precio as precio, codigo as codigo FROM modelo WHERE id="+id, function(err, rows) {
		
		if(rows[0]==undefined)
		{
			resp.status(404);
			resp.send("No existe el item con id= "+id)
		} 
		else
		{
			resp.send(rows[0])
		}
		
	  });
	}
})




//Crea un modelo a partir de un formato json enviado en el body ej: {nombre: 'test',descripcion:'modelo para test', codigo:'T1', precio:12}
//Solo puede realizarse por usuario tipo admin
//recibe el token de la cabezera authorization para la comprobación
app.post('/api/modelos', function(pet, resp) {
   var nuevo = pet.body;

   //console.log(nuevo);
   //console.log(pet.headers['authorization'])
   var authorization=pet.headers['authorization'];

	if(authorization!=undefined)
	{


   var auth=authorization.split(" ");
  
   var token=auth[1]
   var decoded = jwt.decode(token, secret)
 
   login=decoded['login'];
   //console.log(esAdmin(login));
   db.all("SELECT * from usuario WHERE nombre='"+login+"'", function(err, rows) {
		
		if(rows[0]==undefined)
		{
			resp.status(401);
			resp.send("Usuario no existente");
			
		}
		else
		{
			usu=rows[0]
			if(usu['tipo']==1)
			{
						
			   if (nuevo.nombre && nuevo.descripcion && nuevo.codigo && nuevo.precio) 
			   {
			     
				
				 db.run("INSERT INTO modelo VALUES (?,?,?,?)",nuevo.codigo, nuevo.nombre, nuevo.descripcion, nuevo.precio,function(err){
			                    if(err){
			                        resp.send("Error en la sql")
			                    }else{
			                        //console.log("Id: "+this.lastID);
			                        resp.header('Location','http://localhost:3000/api/modelos/'+this.lastID)
			                        var creado={id:this.lastID,codigo:nuevo.codigo, nombre:nuevo.nombre, descripcion:nuevo.descripcion, precio:nuevo.precio}
				 
									 resp.status(201)
									 //Fundamentalismo REST
									 
									 //En la práctica muchos APIs devuelven el objeto creado, incluyendo id
									 resp.send(creado)   

			                    }
			                }); 
				 
				  
			   }
			   else {
			   	 resp.status(400)
			   	 resp.send("el objeto no tiene los campos adecuados")
			   }
				
			}
			else
			{
				//console.log("No tipo 1")
				 resp.status(403)
			   	 resp.send("No tienes permisos de administrador")
			}
		}
		

	})
	} 
	else
	{
		resp.status(401)
		resp.send("Usuario no logueado")
	}	
})

app.put('/api/modelos/:id', function(pet, resp) {
   var nuevo = pet.body;
   var idParam = parseInt(pet.params.id)
   //console.log(nuevo);
   //console.log(pet.headers['authorization'])
   var authorization=pet.headers['authorization'];

	if(authorization!=undefined)
	{


   var auth=authorization.split(" ");
  
   var token=auth[1]
   var decoded = jwt.decode(token, secret)
 
   login=decoded['login'];
   //console.log(esAdmin(login));
   db.all("SELECT * from usuario WHERE nombre='"+login+"'", function(err, rows) {
		
		if(rows[0]==undefined)
		{
			resp.status(401);
			resp.send("Usuario no existente");
			
		}
		else
		{
			usu=rows[0]
			if(usu['tipo']==1)
			{
						
			   if (nuevo.nombre && nuevo.descripcion && nuevo.codigo && nuevo.precio) 
			   {
			     
				
				 db.run("UPDATE modelo SET codigo = ? , nombre = ?, descripcion = ?, precio = ? WHERE rowid = ?",nuevo.codigo, nuevo.nombre, nuevo.descripcion, nuevo.precio, idParam, function(err){
			                    if(err){
			                    	resp.status(401)
			                        resp.send("Error en la sql: "+ err)
			                       
			                    }else{
			                        //console.log("Id: "+this.lastID);
			                        resp.header('Location','http://localhost:3000/api/modelos/'+idParam)
			                        var creado={id:idParam,codigo:nuevo.codigo, nombre:nuevo.nombre, descripcion:nuevo.descripcion, precio:nuevo.precio}
				 
									 resp.status(200)
									 //Fundamentalismo REST
									 
									 //En la práctica muchos APIs devuelven el objeto creado, incluyendo id
									 resp.send(creado)   

			                    }
			                }); 
				 
				  
			   }
			   else {
			   	 resp.status(400)
			   	 resp.send("el objeto no tiene los campos adecuados")
			   }
				
			}
			else
			{
				//console.log("No tipo 1")
				 resp.status(403)
			   	 resp.send("No tienes permisos de administrador")
			}
		}
		

	})
	} 
	else
	{
		resp.status(401)
		resp.send("Usuario no logueado")
	}	
})
//Delete del objeto por id
app.delete('/api/modelos/:id', function(pet, resp){
	var id = parseInt(pet.params.id)
	
	if (isNaN(id)) {
		resp.status(400);
		resp.end();
	}
	else 
	{
		var authorization=pet.headers['authorization'];

		if(authorization!=undefined)
		{


	   var auth=authorization.split(" ");
	  
	   var token=auth[1]
	   var decoded = jwt.decode(token, secret)
	 
	   login=decoded['login'];
	   

	   		db.all("SELECT * from usuario WHERE nombre='"+login+"'", function(err, rows) {
			
				if(rows[0]==undefined)
				{
					resp.status(401);
					resp.send("Usuario no existente");
					
				}
				else
				{
					usu=rows[0]
					if(usu['tipo']==1)
					{
					db.run("DELETE from modelo where rowid="+id, function(err) {

						if (err) 
						{
							console.log(err)
							resp.status(404)
							resp.send('No existe el item con id ' + id);
						}
						else
						{
							console.log("Modelo borrado: "+ id)
							resp.end();
						}
					});
					}
					else
					{
						 resp.status(403)
				   		 resp.send("No tienes permisos de administrador")
					}
			
				}
			})
		}
		else
		{
			resp.status(401)
		resp.send("Usuario no logueado")
		}
	}


})

//Parte usuarios
//Si es correcto devuelve un token 
app.post('/api/doLogin', function(pet, resp){
	var usuario=pet.body;
	var log=usuario.login;
	var pass=usuario.pass;
		db.all("SELECT nombre as nombre, pass as pass FROM usuario WHERE nombre='"+log+"'", function(err, rows) {
			
		if(rows[0]!=undefined)
		{
			usuReal=rows[0]
			if(usuReal['pass']==pass) 
			{
				var payload= {
				login : log,
				exp : moment().add(7, 'days').valueOf()
				}
				var token =jwt.encode(payload, secret);

				
				resp.send(token)
			}
			else
			{
				resp.status(401);
				resp.send("Contraseña incorrecta");
			}
			
		}
		else
		{
			resp.status(404);
			resp.send("Usuario no existente");

		}
	})

})

//Registro simple, crea usuarios normales
app.post('/api/registro', function(pet, resp){
	var usuario=pet.body;
	var log=usuario.login;
	var pass=usuario.pass;
		db.all("SELECT nombre as nombre FROM usuario WHERE nombre='"+log+"'", function(err, rows) {
			
		if(rows[0]==undefined)
		{
			
			
			 if (usuario.login && usuario.pass) 
			   {
			     
				 //Crear un usuario normal sin permisos de administrador (tipo=0)
				 var tipo=0;
				 db.run("INSERT INTO usuario VALUES (?,?,?)",usuario.login, usuario.pass, tipo, function(err){
			                    if(err){
			                        resp.send("Error en la sql")
			                    }else{
			                        //console.log("Id: "+this.lastID);
	
									 resp.status(201)
									 resp.send("Usuario creado correctamente")   

			                    }
			                }); 
				 
				  
			   }
			   else {
			   	 resp.status(400)
			   	 resp.send("el objeto no tiene los campos adecuados")
			   }
			
		}
		else
		{
			resp.status(401);
			resp.send("El usuario ya está registrado");

		}
	})

})

//Muestra todos los usuarios, solo visible para administrador
//Recibe cabezera authorization
app.get('/api/usuarios', function(pet, resp){
	
	//console.log(pet.query.page)
	var auth=pet.headers['authorization'].split(" ");
   //console.log(auth[1])
   var token=auth[1]
   var decoded = jwt.decode(token, secret)
   
   login=decoded['login'];
	 db.all("SELECT * from usuario WHERE nombre='"+login+"'", function(err, rows) {
		
		if(rows[0]==undefined)
		{
			resp.status(401);
			resp.send("Usuario no existente");
			
		}
		else
		{
			usu=rows[0]
			if(usu['tipo']==1)
			{
						
			   db.all("SELECT nombre as nombre FROM usuario", function(err, rows) {
					var pagina=pet.query.page;
					var n=5;
					if(pagina==undefined)
					{
					  resp.send(rows)
					} else
					{
					  resp.send(rows.splice(n*pagina,(n*pagina)+n))	
					}
					
			  });
				
			}
			else
			{
				//console.log("No tipo 1")
				 resp.status(401)
			   	 resp.send("No tienes permisos de administrador")
			}
		}
		
	})
	
	
})


//Parte tallas
//Tallas del modelo por id
app.get('/api/modelos/:id/tallas', function(pet,resp){
	var id = parseInt(pet.params.id)
	console.log(id)
	if(isNaN(id)) {
		resp.status(400);
		resp.send("Fallo en la petición");
	} 
	else
	{
	db.all("SELECT talla.rowid as id, talla.numero as numero, talla.cantidad as cantidad, talla.idmodelo as idmodelo FROM talla, modelo "+ 
		"WHERE modelo.rowid=talla.idmodelo and talla.idmodelo="+id, function(err, rows) {
		
		
			resp.send(rows)
		
	  });
	}
})

//Crea una talla a partir de un formato json enviado en el body ej: {numero: 37,cantidad: 3} y el id del modelo
//Solo puede realizarse por usuario tipo admin
//recibe el token de la cabezera authorization para la comprobación
app.post('/api/modelos/:id/tallas', function(pet,resp){
	var id = parseInt(pet.params.id)
	 var nuevo = pet.body;

   //console.log(nuevo);
   //console.log(pet.headers['authorization'])
   var authorization=pet.headers['authorization'];

	if(authorization!=undefined)
	{


   var auth=authorization.split(" ");
  
   var token=auth[1]
   var decoded = jwt.decode(token, secret)
 
   login=decoded['login'];
   //console.log(esAdmin(login));
   db.all("SELECT * from usuario WHERE nombre='"+login+"'", function(err, rows) {
		
		if(rows[0]==undefined)
		{
			resp.status(401);
			resp.send("Usuario no existente");
			
		}
		else
		{
			usu=rows[0]
			if(usu['tipo']==1)
			{
						
			   if (nuevo.numero && nuevo.cantidad) 
			   {
			     
				db.all("SELECT * from modelo WHERE rowid="+id, function(err2, rowsModelo) {
					if(rowsModelo[0]!=undefined)
					{

					 db.run("INSERT INTO talla VALUES (?,?,?)",nuevo.numero, nuevo.cantidad, id,function(errSql){
				                    if(errSql){
				                    	resp.status(401)
				                        resp.send("Error en la sql: "+errSql)
				                    }else{
				                        //console.log("Id: "+this.lastID);
				                        resp.header('Location','http://localhost:3000/api/modelos/'+id+'/tallas/'+this.lastID)
				                        var creado={id:this.lastID,numero:nuevo.numero, cantidad:nuevo.cantidad, idmodelo:id}
					 
										 resp.status(201)
										 //Fundamentalismo REST
										 
										 //En la práctica muchos APIs devuelven el objeto creado, incluyendo id
										 resp.send(creado)   

				                    }
				                }); 
					}
					else
					{
						resp.status(404);
						resp.send("El modelo no existe");
					}
					});
				 }
				  
			   
			   else {
			   	 resp.status(400)
			   	 resp.send("el objeto no tiene los campos adecuados")
			   }
				
			}
			else
			{
				//console.log("No tipo 1")
				 resp.status(403)
			   	 resp.send("No tienes permisos de administrador")
			}
		}
		})
	} 
	else
	{
		resp.status(401)
		resp.send("Usuario no logueado")
	}
})

app.put('/api/modelos/:id/tallas/:idtalla', function(pet,resp){
	var id = parseInt(pet.params.id)
	var idt = parseInt(pet.params.idtalla)
	 var nuevo = pet.body;

   //console.log(nuevo);
   //console.log(pet.headers['authorization'])
   var authorization=pet.headers['authorization'];

	if(authorization!=undefined)
	{


   var auth=authorization.split(" ");
  
   var token=auth[1]
   var decoded = jwt.decode(token, secret)
 
   login=decoded['login'];
   //console.log(esAdmin(login));
   db.all("SELECT * from usuario WHERE nombre='"+login+"'", function(err, rows) {
		
		if(rows[0]==undefined)
		{
			resp.status(401);
			resp.send("Usuario no existente");
			
		}
		else
		{
			usu=rows[0]
			if(usu['tipo']==1)
			{
						
			   if (nuevo.cantidad) 
			   {
			     
				db.all("SELECT * FROM talla, modelo WHERE modelo.rowid=talla.idmodelo and talla.idmodelo="+id+" and talla.rowid="+idt, function(err, rowsTallaModelo) {
					if(rowsTallaModelo[0]!=undefined)
					{

					 db.run("UPDATE talla SET cantidad = ? WHERE rowid = ?", nuevo.cantidad, idt,function(errSql){
				                    if(errSql){
				                    	resp.status(401)
				                        resp.send("Error en la sql: "+errSql)
				                    }else{
				                        //console.log("Id: "+this.lastID);
				                        resp.header('Location','http://localhost:3000/api/modelos/'+id+'/tallas/'+idt)
				                        var creado={id:idt,numero:nuevo.numero, cantidad:nuevo.cantidad, idmodelo:id}
					 
										 resp.status(200)
										 //Fundamentalismo REST
										 
										 //En la práctica muchos APIs devuelven el objeto creado, incluyendo id
										 resp.send(creado)   

				                    }
				                }); 
					}
					else
					{
						resp.status(404);
						resp.send("El modelo no está relacionado con la talla o no existe");
					}
					});
				 }
				  
			   
			   else {
			   	 resp.status(400)
			   	 resp.send("el objeto no tiene los campos adecuados")
			   }
				
			}
			else
			{
				//console.log("No tipo 1")
				 resp.status(403)
			   	 resp.send("No tienes permisos de administrador")
			}
		}
		})
	} 
	else
	{
		resp.status(401)
		resp.send("Usuario no logueado")
	}
})

app.listen(process.env.PORT || 3000,function(){
	console.log('Marchando el servidor...')

});

module.exports = app;
