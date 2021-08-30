const express = require('express');
const router = express.Router();

const Note = require('../models/Note');
const {isAuthenticated} = require('../helpers/auth');

router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/new-notes');
});

router.post('/notes/new-note', isAuthenticated, async (req, res) => { //recibir datos del formulario de nueva nota
    const {title,description} = req.body; //descontruir objeto que trae valores del formulario
    const errors = [];
    if(!title) {
        errors.push({text: 'Por favor ingrese un título'});
    }
    if(!description) {
        errors.push({text: 'Por favor ingrese una descripción'});
    }
    if(errors.length > 0){
        res.render('notes/new-notes', { //recargamos pagina reenviando los errores y los valores nuevamente
            errors,
            title,
            description
        });
    } else{
        const newNote = new Note({title, description});
        newNote.user = req.user.id;
        await newNote.save(); //Guarda el valor en mongoDB con moongose
        req.flash('success_msg', 'Nota Agregada Exitosamente'); //agregamos mensaje flash
        res.redirect('/notes'); //redireccionamos a las notas
    }
});

router.get('/notes', isAuthenticated, async (req, res) => {
    await Note.find({user: req.user.id}).sort({date: 'desc'}) //con sort agregamos orden descendente por fecha
        .then(documentos => {
                const contexto = {
                    notes: documentos.map(documento => {
                        return {
                            _id: documento._id,
                            title: documento.title,
                            description: documento.description
                        }
                    })
                }
            res.render('notes/all-notes', {
                notes: contexto.notes }) 
        });
});

router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id);
    res.render('notes/edit-note', { note: note.toObject() });
});

router.put('/notes/edit-note/:id', isAuthenticated, async (req, res) =>{
    const {title, description} = req.body;
    await Note.findByIdAndUpdate(req.params.id, {title, description});
    req.flash('success_msg', 'Nota Actualizada Exitosamente'); //agregamos mensaje flash
    res.redirect('/notes');
});

router.delete('/notes/delete/:id', isAuthenticated, async (req, res) =>{
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Nota Eliminada Exitosamente'); //agregamos mensaje flash
    res.redirect('/notes');
});

module.exports = router;