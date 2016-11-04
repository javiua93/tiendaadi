var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('tienda.db');
 
db.serialize(function() {


 db.run("CREATE TABLE if not exists modelo (codigo TEXT, nombre TEXT, descripcion TEXT, precio DOUBLE)");
 var stmt = db.prepare("INSERT INTO modelo VALUES (?,?,?,?)");  

 
 var nombre = "Aguamar"
 var descripcion = "Zapatillas de estar por casa de señora con perro de lana grabado"
 var codigo = "IN637"
 var precio =16.00
  stmt.run(codigo, nombre, descripcion, precio)

  	 var nombre = "P2"
	 var descripcion = "Sandalias"
	 var codigo = "IN33"
	 var precio =13.00
  stmt.run(codigo, nombre, descripcion, precio)
  stmt.finalize(); 

  db.run("CREATE TABLE if not exists usuario (nombre TEXT, pass TEXT, tipo INTEGER)");
  var stmt = db.prepare("INSERT INTO usuario VALUES (?,?,?)");

  var usu="pepe";
  var pass="123";
  var tipo=0;
	stmt.run(usu, pass, tipo);
  var usu="admin";
  var pass="admin";
  var tipo=1;
	stmt.run(usu, pass, tipo);

	stmt.finalize(); 

	db.run("CREATE TABLE if not exists talla (numero INTEGER NOT NULL UNIQUE, cantidad INTEGER, idModelo INT, FOREIGN KEY(IDMODELO) REFERENCES MODELO(rowid))");
	var stmt = db.prepare("INSERT INTO talla VALUES (?,?,?)");
	var num=37;
	var cant=4;
	var mod=2;
	stmt.run(num,cant,mod)
	stmt.finalize();


  /*db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });*/
});
 
db.close();