var method = Dispositivo.prototype;

var objDispositivo;

function Dispositivo() 
{
 objDispositivo = new Object({
    Id : Number
  , Nombre : String
  , Tipo  : Number
  , Ip : String
  , Puerto : Number
  , Habilitado : Boolean
  , Estado : Boolean
});
}


method.Crear = function(id, Nombre, Tipo, Ip,Puerto,Habilitado,Estado)
{
  
  objDispositivo.Id = id;
  objDispositivo.Nombre = Nombre;
  objDispositivo.Tipo = Tipo;
  objDispositivo.Ip = Ip;
  objDispositivo.Puerto = Puerto;
  objDispositivo.Habilitado = Habilitado;
  objDispositivo.Estado = Estado;
};

method.Objeto = function()
{
  return objDispositivo;
};



module.exports = Dispositivo;


