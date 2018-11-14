import { Op } from 'sequelize';
import db from '../models/index';
import searchController from './searchController';

const { Starship, Transport } = db;

export default {
  create(req, res) {
    return Starship.create({
      ...req.body,
    })
      .then(starship => res.status(201).send(starship))
      .catch(error => res.status(400).send(error));
  },
  list(req, res) {
    if (req.query.search || req.body.search) return this.search(req, res);
    return Starship
      .findAll({ include: Transport })
      .then(starship => res.status(200).send(starship))
      .catch(error => res.status(400).send(error));
  },
  search(req, res) {
    const search = req.body.search != null ? `%${req.body.search}%` : `%${req.query.search}%`;
    return Starship.findAll({
      include: {
        model: Transport,
        where: {
          [Op.or]: [
            {
              name: {
                [Op.iLike]: search,
              },
            },
            {
              model: {
                [Op.iLike]: search,
              },
            },
            {
              manufacturer: {
                [Op.iLike]: search,
              },
            },
          ],
        },
      },
    })
      .then((starship) => {
        if (starship === undefined || starship.length > 0) {
          // If a user searches successfully, it will be saved in the database with query and model.
          const saveUrl = `http://it2810-06.idi.ntnu.no/api${req.url}`;
          searchController.saveSearch(saveUrl, req.query.search, 'starships');
        }
        return res.status(200).send(starship);
      })
      .catch(error => res.status(400).send(error));
  },
};
