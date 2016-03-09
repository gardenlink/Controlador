define({ "api": [
  {
    "type": "get",
    "url": "/desactivarBomba/:id",
    "title": "Activa la bomba ubicada en el pin recibido como parametro",
    "name": "activarBomba",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>de la bomba (Pin de conexion en Arduino)</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "200",
            "description": "<p>OK</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "ECONNREFUSED.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": \"ECONNREFUSED\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/Bomba.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Bomba_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Bomba_js"
  },
  {
    "type": "get",
    "url": "/activarBomba/:id",
    "title": "Activa la bomba ubicada en el pin recibido como parametro",
    "name": "activarBomba",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>de la bomba (Pin de conexion en Arduino)</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "200",
            "description": "<p>HTTP CODE</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "ECONNREFUSED.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": \"ECONNREFUSED\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/Bomba.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Bomba_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Bomba_js"
  },
  {
    "type": "get",
    "url": "/bomba/:id",
    "title": "Obtiene la informacion de la bomba",
    "name": "bomba",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>de la bomba (Pin de conexion en Arduino)</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Json",
            "optional": false,
            "field": "informacion",
            "description": "<p>de la bomba.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{\"supportedModes\":[0,1,2],\n  \"mode\":1,\n  \"value\":0,\n  \"report\":1,\n  \"analogChannel\":0,\n  \"state\":0,\n  \"id\":14,\n  \"TiempoEncendida\":0,\n  \"UltimoRiegoFecha\":\"2015-02-21T16:12:00.252Z\",\n  \"UltimoRiegoTiempo\":0}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "ECONNREFUSED.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": \"ECONNREFUSED\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/Bomba.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Bomba_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Bomba_js"
  },
  {
    "type": "delete",
    "url": "/api/dispositivos/:id",
    "title": "Elimina un dispositivo",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "ok",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/Dispositivo.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "name": "DeleteApiDispositivosId"
  },
  {
    "type": "get",
    "url": "/api/dispositivos",
    "title": "Obtiene el listado de dispositivos",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "array",
            "optional": false,
            "field": "El",
            "description": "<p>arreglo de objetos solicitado</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/Dispositivo.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "name": "GetApiDispositivos"
  },
  {
    "type": "get",
    "url": "/api/dispositivos/:id",
    "title": "Obtener informacion de un dispositivo determinado",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "id",
            "optional": false,
            "field": "id",
            "description": "<p>Dispositivo (unico)</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "El",
            "description": "<p>objeto solicitado.</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/Dispositivo.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "name": "GetApiDispositivosId"
  },
  {
    "type": "post",
    "url": "/api/dispositivos",
    "title": "Crea un dispositivo",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "ok",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/Dispositivo.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "name": "PostApiDispositivos"
  },
  {
    "type": "put",
    "url": "/api/dispositivos/:id",
    "title": "Modifica un dispositivo",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "ok",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/Dispositivo.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "name": "PutApiDispositivosId"
  },
  {
    "type": "put",
    "url": "/api/dispositivos/:id/ip",
    "title": "Modifica la property ip",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "ok",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/Dispositivo.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Dispositivo_js",
    "name": "PutApiDispositivosIdIp"
  },
  {
    "type": "get",
    "url": "/log/:id",
    "title": "Entrga los logs del dia actual",
    "name": "log",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>del dia (ejemplo 1 para el dia actual)</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Json",
            "optional": false,
            "field": "informacion",
            "description": "<p>de la bomba.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n\"{\\\"level\\\":\\\"info\\\",\n  \\\"message\\\":\\\"Temporizador: Encendiendo Bomba..\\\",\n  \\\"timestamp\\\":\\\"2015-02-21T12:10:00.092Z\\\"}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>HTTP Code</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/Log.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Log_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Log_js"
  },
  {
    "type": "get",
    "url": "/log/:id",
    "title": "Entrga el programa de activaciones automaticas de la bomba para los dias seteados en el archivo de configuracion",
    "name": "log",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>del dia (ejemplo 1 para el dia actual)</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Json",
            "optional": false,
            "field": "informacion",
            "description": "<p>de la bomba.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n{ \n [\"2015-02-18T12:10:00.000Z\",\n \"2015-02-18T16:12:00.000Z\",\n \"2015-02-18T20:15:00.000Z\",\n \"2015-02-19T16:12:00.000Z\",\n \"2015-02-19T20:15:00.000Z\",\n \"2015-02-20T12:10:00.000Z\",\n \"2015-02-20T16:12:00.000Z\",\n \"2015-02-20T20:15:00.000Z\",\n \"2015-02-21T12:10:00.000Z\"]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Codigo",
            "description": "<p>de error HTTP 404 si existe un problema al consultar el calendario de activaciones</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/Log.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Log_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Log_js"
  },
  {
    "type": "get",
    "url": "/log/:id",
    "title": "Entrga los logs del dia actual",
    "name": "log",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>del dia (ejemplo 1 para el dia actual)</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Json",
            "optional": false,
            "field": "informacion",
            "description": "<p>de la bomba.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": " HTTP/1.1 200 OK\n\"{\\\"level\\\":\\\"info\\\",\n  \\\"message\\\":\\\"Temporizador: Encendiendo Bomba..\\\",\n  \\\"timestamp\\\":\\\"2015-02-21T12:10:00.092Z\\\"}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>HTTP Code</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/Panel.js",
    "group": "D__Development_Node_GardenLink_Controlador_routes_Panel_js",
    "groupTitle": "D__Development_Node_GardenLink_Controlador_routes_Panel_js"
  },
  {
    "type": "get",
    "url": "/api/tipoactuadores",
    "title": "Obtiene la lista de actuadores",
    "name": "tipoactuadores",
    "group": "TipoActuador",
    "version": "0.0.0",
    "filename": "routes/TipoActuador.js",
    "groupTitle": "TipoActuador"
  },
  {
    "type": "get",
    "url": "/api/tipoactuadores/:id",
    "title": "Obtiene el tipo de actuador",
    "name": "tipoactuadores",
    "group": "TipoActuador",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>TipoActuador unique ID.</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/TipoActuador.js",
    "groupTitle": "TipoActuador"
  }
] });