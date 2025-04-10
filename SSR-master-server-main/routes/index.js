var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Data-Logger' });
});

// GET: Guardado con Query Params
router.get('/record', function(req, res) {
    saveData(req.query, res);
});

// POST: Guardado con JSON en el cuerpo
router.post('/record', function(req, res) {
    saveData(req.body, res);
});

function saveData(data, res) {
    if (!data.id_nodo || !data.temperatura || !data.humedad || !data.co2 || !data.volatiles) {
        return res.status(400).send("Error: Faltan parámetros en la solicitud.");
    }

    var now = new Date();
    var logfile_name = __dirname + '/../public/logs/' + data.id_nodo + "-" + 
        now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + '.csv';

    let content = data.id_nodo + ';' + now.getTime() + ";" + 
                  data.temperatura + ";" + data.humedad + ";" + 
                  data.co2 + ";" + data.volatiles + "\r\n";

    fs.stat(logfile_name, function(err, stat) {
        if (err && err.code === 'ENOENT') {
            // Si el archivo no existe, crear con encabezado
            let header = 'id_nodo; timestamp; temperatura; humedad; CO2; volatiles\r\n';
            append2file(logfile_name, header + content, res);
        } else {
            append2file(logfile_name, content, res);
        }
    });
}

function append2file(file2append, content, res) {
    fs.appendFile(file2append, content, function(err) {
        if (err) {
            console.error("Error al guardar en archivo:", err);
            return res.status(500).send("Error al guardar en el archivo.");
        }
        
        console.log("Guardado en:", file2append);
        res.status(200).send("Datos guardados correctamente en: " + file2append);
    });
}

module.exports = router;
