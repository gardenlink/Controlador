// Consulta el estado actual de la bomba llamando a la api rest
function EstadoActual()
{  
      $.ajax({ 
         type: "GET",
         url: "/bomba/1",
         success: function(data){ 
            if (data["Encendida"] == true)
            {
              $("#toggle-b1").bootstrapToggle('on')
              //$("#lblEstado").html("Activada");           
            }
            else if (data["Encendida"] == false)
            {
              //$("#lblEstado").html("Desactivada");
              $("#toggle-b1").bootstrapToggle('off')
            }
            else
            {
             $("#lblEstado").html("No se puede obtener estado, revisar estado servidor");
             $("#toggle-b1").bootstrapToggle('disabled') 
            }

            $("#lblTiempo").html(data["TiempoEncendida"]);
            $("#lblFechaUltimoRiego").html(DateParse(data["UltimoRiegoFecha"]));
            $("#lblTiempoUltimoRiego").html(data["UltimoRiegoTiempo"]);
          },
             error: function(data){  
                 $("#lblEstado").html("No se puede obtener estado, revisar estado servidor"); 
             }
     });
  
}


 $('#toggle-b1').click(function() {
  alert("chuto");
  //alert($("#toggle-b1").prop('checked'));
 });



// Envia señal de encendido a la api rest
function Encender()
{

 $.ajax({ 
         type: "GET",
         url: "/activarBomba/1",
         success: function(data){        
            
           EstadoActual();
            
          }
     });

}


// Obtiene la URL del grafico
function ObtenerEstadoSalud()
{

 $.ajax({ 
         type: "GET",
         url: "/monitor/Graficar/A5",
         success: function(data){        

           $("#iEstadoSalud").attr('src', data + '?width=640&height=480');
            
          }
     });

}

// Envia señal de apagado a la api rest
function Apagar()
{
   $.ajax({ 
         type: "GET",
         url: "/desactivarBomba/1",
         success: function(data){        
            
           EstadoActual();
            
          }
     });
}

//obtiene el calendario programado
function Programacion()
{
  $.ajax({
    type: "GET",
    url:"/temporizador/Encendidas",
    success: function(data) {
      $("#tabla").html("");
      $("#tabla").append("<tr><td>Inicio Automatico N° </td><td> Fecha Ejecucion </td></tr>")
      $.each(data, function (i, item) {
          if (Date(item) >= Date())
          {

            $("#tabla").append("<tr><td>" + i + "</td><td>" + DateParse_dd_mm_yyyy_hh_mm(item) + "</td></tr>");
          }
        });

       $("#tabla").append("</table>");
       
       

       
    }
  });
}

//obtener el lisado de logs
function Logs()
{

  $.ajax({
    type: "GET",
    url:"/log/id",
    success: function(data) {
      
      
      $("#tabla").html("");
      $("#tabla").append("<tr><td>Fecha </td><td> level </td><td> Mensaje </td></tr>");
      $("#tabla").append("</tr>");

      
      var jsonData;
      var error;
      var tdview;

      $.each(data.split("\n"), function (i, item) {
        jsonData = jQuery.parseJSON(item);
        if (jsonData.level == "error")
          trview = "<tr class=danger>";
        else trview = "<tr class=active>";
        
        if (jsonData.message == undefined)
          error = jsonData.errno;
        else
          error = jsonData.message;

        $("#tabla").append(trview + "<td>" + DateParse(jsonData.timestamp) + "</td><td>" + jsonData.level + "</td><td>" + error + "</td></tr>");
        });

       $("#tabla").append("</table>");
       
       

       }
    
  });
}


function b1_click(){ 
  $("#b1").toggleClass("btn btn-success active");
  $("#b2").toggleClass("btn")
}

function b2_click(){ 
  $("#b2").toggleClass("btn btn-success active");
  $("#b1").toggleClass("btn")
}


function DateParse(date) {
  
   var tdate = new Date(date);
   var dd = tdate.getDate(); //yields day
   var MM = tdate.getMonth(); //yields month
   var yyyy = tdate.getFullYear(); //yields year
   var hhhh = tdate.getHours();
   var mmmm = tdate.getMinutes();
   var ssss = tdate.getSeconds();
   var xxx = dd + "-" +( MM+1) + "-" + yyyy + " " + hhhh + ":" + mmmm + ":" + ssss; 


   return xxx;
}

function DateParse_dd_mm_yyyy_hh_mm(date) {
  var tdate = new Date(date);
   var dd = tdate.getDate(); //yields day
   var MM = tdate.getMonth(); //yields month
   var yyyy = tdate.getFullYear(); //yields year
   var hhhh = tdate.getHours();
   var mmmm = tdate.getMinutes();
   var xxx = dd + "-" +( MM+1) + "-" + yyyy + " " + hhhh + ":" + mmmm;

   return xxx;
  
}

