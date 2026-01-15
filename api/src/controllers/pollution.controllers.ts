import { Request, Response } from "express";
import db from "../models/index.js";
import { validatePollutionData, validateNumericId } from "../utils/validators.js";

const Pollution = db.pollutions;

// Create a new pollution report
export function create(req: Request, res: Response): void {
  // Validate input
  const validationErrors = validatePollutionData(req.body);
  if (validationErrors.length > 0) {
    res.status(400).send({
      message: "Données invalides",
      errors: validationErrors
    });
    return;
  }

  const pollution = {
    title: req.body.title,
    type: req.body.type,
    description: req.body.description,
    observedAt: req.body.observedAt,
    location: req.body.location,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    photoUrl: req.body.photoUrl,
    discoveredBy: req.body.discoveredBy
  };

  Pollution.create(pollution)
    .then(data => {
      res.status(201).send(data);
    })
    .catch(err => {
      res.status(400).send({
        message: err.message || "Error creating pollution report"
      });
    });
}

// Get all pollutions
export function findAll(req: Request, res: Response): void {
  Pollution.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(400).send({
        message: err.message || "Error retrieving pollutions"
      });
    });
}

// Get a single pollution by ID
export function findById(req: Request, res: Response): void {
  const id = req.params.id;

  // Validate ID
  const idError = validateNumericId(id);
  if (idError) {
    res.status(400).send({
      message: idError.message
    });
    return;
  }

  Pollution.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Pollution with id=${id}`
        });
      }
    })
    .catch(err => {
      res.status(400).send({
        message: "Error retrieving Pollution with id=" + id
      });
    });
}

// Update a pollution by ID
export function update(req: Request, res: Response): void {
  const id = req.params.id;

  // Validate ID
  const idError = validateNumericId(id);
  if (idError) {
    res.status(400).send({
      message: idError.message
    });
    return;
  }

  // Validate input data
  const validationErrors = validatePollutionData(req.body);
  if (validationErrors.length > 0) {
    res.status(400).send({
      message: "Données invalides",
      errors: validationErrors
    });
    return;
  }

  Pollution.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num[0] === 1) {
        // Fetch and return the updated record
        Pollution.findByPk(id)
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(400).send({
              message: "Error fetching updated Pollution"
            });
          });
      } else {
        res.status(404).send({
          message: `Cannot update Pollution with id=${id}. Maybe Pollution was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(400).send({
        message: "Error updating Pollution with id=" + id
      });
    });
}

// Delete a pollution by ID
export function remove(req: Request, res: Response): void {
  const id = req.params.id;

  // Validate ID
  const idError = validateNumericId(id);
  if (idError) {
    res.status(400).send({
      message: idError.message
    });
    return;
  }

  Pollution.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num === 1) {
        res.status(204).send();
      } else {
        res.status(404).send({
          message: `Cannot delete Pollution with id=${id}. Maybe Pollution was not found!`
        });
      }
    })
    .catch(err => {
      res.status(400).send({
        message: "Could not delete Pollution with id=" + id
      });
    });
}

// Upload photo for a pollution
export function uploadPhoto(req: Request, res: Response): void {
  const id = req.params.id;

  // Validate ID
  const idError = validateNumericId(id);
  if (idError) {
    res.status(400).send({
      message: idError.message
    });
    return;
  }

  // Check if file exists
  if (!req.file) {
    res.status(400).send({
      message: "Aucun fichier fourni"
    });
    return;
  }

  // Update pollution with photo data
  Pollution.update({
    photo: req.file.buffer,
    photoMimeType: req.file.mimetype
  }, {
    where: { id: id }
  })
    .then(num => {
      if (num[0] === 1) {
        res.send({
          message: "Photo uploadée avec succès",
          filename: req.file!.originalname,
          size: req.file!.size
        });
      } else {
        res.status(404).send({
          message: `Cannot find Pollution with id=${id}`
        });
      }
    })
    .catch(err => {
      res.status(400).send({
        message: "Error uploading photo: " + err.message
      });
    });
}

// Get photo for a pollution
export function getPhoto(req: Request, res: Response): void {
  const id = req.params.id;

  // Validate ID
  const idError = validateNumericId(id);
  if (idError) {
    res.status(400).send({
      message: idError.message
    });
    return;
  }

  Pollution.findByPk(id, {
    attributes: ['photo', 'photoMimeType']
  })
    .then(data => {
      if (data && data.photo) {
        res.setHeader('Content-Type', data.photoMimeType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.send(data.photo);
      } else {
        res.status(404).send({
          message: `No photo found for Pollution with id=${id}`
        });
      }
    })
    .catch(err => {
      res.status(400).send({
        message: "Error retrieving photo: " + err.message
      });
    });
}
