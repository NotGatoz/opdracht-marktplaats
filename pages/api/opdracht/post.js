import { pool } from '../../../lib/db';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ error: 'Fout bij verwerken van formulier' });
    }

    const {
      title,
      description,
      category,
      deadline,
      location_city,
      location_address,
      location_postcode,
      opbouw_date,
      opbouw_time,
      hard_opbouw,
      opbouw_dagen_amount,
      opbouw_men_needed,
      planning_afbouw_date,
      planning_afbouw_time,
      hard_afbouw,
      afbouw_dagen_amount,
      afbouw_men_needed,
      opbouw_transport_type,
      opbouw_transport_amount,
      afbouw_transport_type,
      afbouw_transport_amount,
      opbouw_hoogwerkers_type,
      opbouw_hoogwerkers_amount,
      afbouw_hoogwerkers_type,
      afbouw_hoogwerkers_amount,
      magazijnbon_link,
      project_map_opbouw_link,
      project_map_afbouw_link,
      storageplace_adres,
      userId
    } = fields;

    // Convert arrays to single values if needed
    const titleVal = Array.isArray(title) ? title[0] : title;
    const descriptionVal = Array.isArray(description) ? description[0] : description;
    const categoryVal = Array.isArray(category) ? category[0] : category;
    const deadlineVal = Array.isArray(deadline) ? deadline[0] : deadline;
    const location_cityVal = Array.isArray(location_city) ? location_city[0] : location_city;
    const location_addressVal = Array.isArray(location_address) ? location_address[0] : location_address;
    const location_postcodeVal = Array.isArray(location_postcode) ? location_postcode[0] : location_postcode;
    const opbouw_dateVal = Array.isArray(opbouw_date) ? opbouw_date[0] : opbouw_date;
    const opbouw_timeVal = Array.isArray(opbouw_time) ? opbouw_time[0] : opbouw_time;
    const hard_opbouwVal = Array.isArray(hard_opbouw) ? hard_opbouw[0] : hard_opbouw;
    const opbouw_dagen_amountVal = Array.isArray(opbouw_dagen_amount) ? opbouw_dagen_amount[0] : opbouw_dagen_amount;
    const opbouw_men_neededVal = Array.isArray(opbouw_men_needed) ? opbouw_men_needed[0] : opbouw_men_needed;
    const planning_afbouw_dateVal = Array.isArray(planning_afbouw_date) ? planning_afbouw_date[0] : planning_afbouw_date;
    const planning_afbouw_timeVal = Array.isArray(planning_afbouw_time) ? planning_afbouw_time[0] : planning_afbouw_time;
    const hard_afbouwVal = Array.isArray(hard_afbouw) ? hard_afbouw[0] : hard_afbouw;
    const afbouw_dagen_amountVal = Array.isArray(afbouw_dagen_amount) ? afbouw_dagen_amount[0] : afbouw_dagen_amount;
    const afbouw_men_neededVal = Array.isArray(afbouw_men_needed) ? afbouw_men_needed[0] : afbouw_men_needed;
    const opbouw_transport_typeVal = Array.isArray(opbouw_transport_type) ? opbouw_transport_type[0] : opbouw_transport_type;
    const opbouw_transport_amountVal = Array.isArray(opbouw_transport_amount) ? opbouw_transport_amount[0] : opbouw_transport_amount;
    const afbouw_transport_typeVal = Array.isArray(afbouw_transport_type) ? afbouw_transport_type[0] : afbouw_transport_type;
    const afbouw_transport_amountVal = Array.isArray(afbouw_transport_amount) ? afbouw_transport_amount[0] : afbouw_transport_amount;
    const opbouw_hoogwerkers_typeVal = Array.isArray(opbouw_hoogwerkers_type) ? opbouw_hoogwerkers_type[0] : opbouw_hoogwerkers_type;
    const opbouw_hoogwerkers_amountVal = Array.isArray(opbouw_hoogwerkers_amount) ? opbouw_hoogwerkers_amount[0] : opbouw_hoogwerkers_amount;
    const afbouw_hoogwerkers_typeVal = Array.isArray(afbouw_hoogwerkers_type) ? afbouw_hoogwerkers_type[0] : afbouw_hoogwerkers_type;
    const afbouw_hoogwerkers_amountVal = Array.isArray(afbouw_hoogwerkers_amount) ? afbouw_hoogwerkers_amount[0] : afbouw_hoogwerkers_amount;
    const magazijnbon_linkVal = Array.isArray(magazijnbon_link) ? magazijnbon_link[0] : magazijnbon_link;
    const project_map_opbouw_linkVal = Array.isArray(project_map_opbouw_link) ? project_map_opbouw_link[0] : project_map_opbouw_link;
    const project_map_afbouw_linkVal = Array.isArray(project_map_afbouw_link) ? project_map_afbouw_link[0] : project_map_afbouw_link;
    const storageplace_adresVal = Array.isArray(storageplace_adres) ? storageplace_adres[0] : storageplace_adres;
    const userIdVal = Array.isArray(userId) ? userId[0] : userId;

    // Validation
    if (!titleVal || !descriptionVal || !deadlineVal || !userIdVal) {
      return res.status(400).json({ error: 'Alle verplichte velden zijn vereist' });
    }

    try {
      // Handle file uploads - store file paths or base64
      let imagesData = null;
      let pdfsData = null;
      let pdfFilenames = null;

      if (files.images) {
        const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
        const imagePromises = imageFiles.map(file => {
          return new Promise((resolve, reject) => {
            fs.readFile(file.filepath, (err, data) => {
              if (err) reject(err);
              else resolve(data.toString('base64'));
            });
          });
        });
        imagesData = await Promise.all(imagePromises);
      }

      if (files.pdfs) {
        const pdfFiles = Array.isArray(files.pdfs) ? files.pdfs : [files.pdfs];
        const pdfPromises = pdfFiles.map(file => {
          return new Promise((resolve, reject) => {
            fs.readFile(file.filepath, (err, data) => {
              if (err) reject(err);
              else resolve(data.toString('base64'));
            });
          });
        });
        pdfsData = await Promise.all(pdfPromises);
        pdfFilenames = pdfFiles.map(file => file.originalFilename);
      }

      const query = `
        INSERT INTO opdrachten (
          user_id, title, description, category, deadline,
          location_city, location_address, location_postcode,
          opbouw_date, opbouw_time,
          hard_opbouw, opbouw_dagen_amount, opbouw_men_needed,
          planning_afbouw_date, planning_afbouw_time,
          hard_afbouw, afbouw_dagen_amount, afbouw_men_needed,
          opbouw_transport_type, opbouw_transport_amount,
          afbouw_transport_type, afbouw_transport_amount,
          opbouw_hoogwerkers_type, opbouw_hoogwerkers_amount,
          afbouw_hoogwerkers_type, afbouw_hoogwerkers_amount,
          magazijnbon_link, project_map_opbouw_link, project_map_afbouw_link, storageplace_adres,
          images, pdfs, pdf_filenames,
          created_at, status
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10,
          $11, $12, $13,
          $14, $15,
          $16, $17, $18,
          $19, $20,
          $21, $22,
          $23, $24,
          $25, $26,
          $27, $28, $29, $30,
          $31, $32, $33,
          NOW(), 'open'
        )
        RETURNING id, user_id, title, description, category, deadline,
          location_city, location_address, location_postcode,
          opbouw_date, opbouw_time,
          hard_opbouw, opbouw_dagen_amount, opbouw_men_needed,
          planning_afbouw_date, planning_afbouw_time,
          hard_afbouw, afbouw_dagen_amount, afbouw_men_needed,
          opbouw_transport_type, opbouw_transport_amount,
          afbouw_transport_type, afbouw_transport_amount,
          opbouw_hoogwerkers_type, opbouw_hoogwerkers_amount,
          afbouw_hoogwerkers_type, afbouw_hoogwerkers_amount,
          magazijnbon_link, project_map_opbouw_link, project_map_afbouw_link, storageplace_adres,
          created_at, status
      `;

      const values = [
        userIdVal, titleVal, descriptionVal, categoryVal || null, deadlineVal,
        location_cityVal || null, location_addressVal || null, location_postcodeVal || null,
        opbouw_dateVal || null, opbouw_timeVal || null,
        hard_opbouwVal || null, opbouw_dagen_amountVal || null, opbouw_men_neededVal || null,
        planning_afbouw_dateVal || null, planning_afbouw_timeVal || null,
        hard_afbouwVal || null, afbouw_dagen_amountVal || null, afbouw_men_neededVal || null,
        opbouw_transport_typeVal || null, opbouw_transport_amountVal || null,
        afbouw_transport_typeVal || null, afbouw_transport_amountVal || null,
        opbouw_hoogwerkers_typeVal || null, opbouw_hoogwerkers_amountVal || null,
        afbouw_hoogwerkers_typeVal || null, afbouw_hoogwerkers_amountVal || null,
        magazijnbon_linkVal || null, project_map_opbouw_linkVal || null, project_map_afbouw_linkVal || null, storageplace_adresVal || null,
        imagesData, pdfsData, pdfFilenames
      ];

      const result = await pool.query(query, values);

      if (!result.rows.length) {
        return res.status(500).json({ error: 'Opdracht kan niet worden aangemaakt' });
      }

      return res.status(201).json({
        message: 'Opdracht succesvol geplaatst',
        opdracht: result.rows[0],
      });
    } catch (err) {
      console.error('Error creating opdracht:', err);
      return res.status(500).json({
        error: 'Fout bij het plaatsen van de opdracht',
        detail: err.message,
      });
    }
  });
}
