import { db } from "../../../config/database"
import { Patient, PatientReq,  } from "./model"
import logger from '../../../utils/logger'
import { CreationError, GetAllError, DeleteError, UpdateError, RecordNotFoundError } from "../../../utils/customErrors"

export class PatientRepository {
    public async createPatient(patient: PatientReq): Promise<Patient> {
        try {
            const [createdPatient] =  await db('pacientes').insert(patient).returning('*') 
            return createdPatient
        } catch (error) {
            throw new CreationError(`Failed to create patient dubt: ${error}`, "PatientCreation")
        }
    }

    public async getAllPatients(): Promise<Patient[]> {
        try {
            return  db.select('*').from('pacientes')
        } catch (error) {
            throw new GetAllError("Failed getting all patients from repository", "PatientGetAll")
        }
    }

    public async getPatientById(id: number): Promise<Patient> {
        try{
            const patient = await db('pacientes').where({ id_paciente: id }).first()
            return patient
        } catch (error){
            logger.error( 'Failed get patient by id in repository', {error})
            throw new RecordNotFoundError()
        }
    }
    public async deletePatient(id: number): Promise<void> {
        try{
            await db('pacientes').where({ id_cita: id }).del()
        } catch (error){
            logger.error( 'Failed deleting pacientes in repository', {error})
            throw new DeleteError(`Failed deleting pacientes dubt: ${error}`, "PacientesDelete")
        }
    }
    public async updatePatient(id: number, updates: Partial<PatientReq>): Promise<void> {
        try{
            await db('pacientes').where({ id_paciente: id }).update(updates)
        } catch (error){
            logger.error( 'Failed updated pacientes in repository', {error})
            throw new UpdateError(`Failed updated pacientes in repository: ${error}`, "PacientesUpdate")
        }
    }
}