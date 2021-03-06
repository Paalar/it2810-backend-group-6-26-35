import { Op } from 'sequelize';
import db from '../models/index';
import searchController from './searchController';
import searchQuery from '../utils/searchQuery';

const { Starship, Transport } = db;

export default {

  list(req, res) {
    return this.search(req)
      .then((starship) => {
        if (starship.count && req.query.search) {
        // If user searches successfully, it will be saved in the database with query and model.
          searchController.saveSearch(req.originalUrl, req.query.search, 'starships');
        }
        return starship;
      })
      .then(starship => res.status(200).send(starship))
      .catch(() => res.status(400).send('Oopsie Woopsie we made a fucky wucky (400 bad request)'));
  },
  search(req) {
    const query = Object.keys(req.body).length ? req.body : req.query;
    const {
      sortBy = 'id', order = 'asc', search, limit = 100, offset = 0,
    } = query;
    return Starship.findAndCountAll({
      limit,
      offset,
      order: [
        [{
          model: Transport,
          foreignKey: 'transportId',
        },
        sortBy.toLowerCase(), order.toUpperCase()],
      ],
      include: {
        model: Transport,
        where: {
          [Op.or]: searchQuery(search, ['name', 'model', 'manufacturer']),
        },
      },
    });
  },
};
