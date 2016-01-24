var method = Dispositivo.prototype;

var objDispositivo;

function Dispositivo() 
{
 objDispositivo = new Object({
    Id : String
  , Nombre : String
  , Tipo  : String
  , Ip : String
  , Puerto : Number
  , Habilitado : Boolean
  , Estado : Boolean
  , FrecuenciaMuestreo : Number
});
}


method.Crear = function(id, Nombre, Tipo, Ip,Puerto,Habilitado,Estado,FrecuenciaMuestreo)
{
  objDispositivo.Id = id;
  objDispositivo.Nombre = Nombre;
  objDispositivo.Tipo = Tipo;
  objDispositivo.Ip = Ip;
  objDispositivo.Puerto = Puerto;
  objDispositivo.Habilitado = Habilitado;
  objDispositivo.Estado = Estado;
  objDispositivo.FrecuenciaMuestreo = FrecuenciaMuestreo;
};

method.Validar = function(objDispositivo)
{
  if (!objDispositivo.Id)
  {
    console.log("dto.Dispositivo : La property ID no puede ser null");
    return false;
  }
  return true;

}

method.Objeto = function()
{
  return objDispositivo;
};



module.exports = Dispositivo;


