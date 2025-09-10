"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const geolocation_controller_1 = require("../controllers/geolocation.controller");
const router = (0, express_1.Router)();
router.post('/search', auth_1.isAuthenticated, geolocation_controller_1.searchGeoLocations);
router.get('/', auth_1.isAuthenticated, geolocation_controller_1.getUserGeolocationHistory);
exports.default = router;
