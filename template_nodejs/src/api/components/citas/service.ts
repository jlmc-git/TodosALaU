import { CreationError, DeleteError, UpdateError, RecordNotFoundError, GetAllError } from "../../../utils/customErrors"
import logger from "../../../utils/logger"
import { AppointmentReq, Appointment, AppointmentResDB } from "./model"
import { AppointmentRepository } from "./repository"
import { DoctorRepository } from "../doctores/repository"
import { Doctor } from "../doctores/model"
import { PatientRepository } from "../pacientes/repository"

export interface AppointmentService {
    getAllAppointments(): Promise<Appointment[]>
    createAppointment(patientReq: AppointmentReq): Promise<Appointment>
    getAppointmentById(id: number): Promise<Appointment>
    deleteAppointment(id: number): Promise<void>
}


export class AppointmentServiceImpl implements AppointmentService {
    private appointmentRepository: AppointmentRepository
    private doctorRepository: DoctorRepository
    private patientRepository: PatientRepository

    constructor(appointmentRepository: AppointmentRepository, doctorRepository: DoctorRepository,
        patientRepository: PatientRepository){
        this.appointmentRepository = appointmentRepository
        this.doctorRepository = doctorRepository
        this.patientRepository = patientRepository
    }

    public async getAllAppointments(): Promise<Appointment[]> {
        try{
            
            const patients = await  this.appointmentRepository.getAllAppointment()
            console.log(patients)
            return patients
        } catch (error){
            logger.error(error)
            throw new GetAllError("Failed getting all appointments from service", "appointment")
        }
    }
    
    public  async createAppointment(appointmentReq: ): Promise<Appointment> {
        try{
            const doctorExist = await this.doctorRepository.getDoctorById(appointmentReq.id_doctor)
            if (!doctorExist){
                throw new RecordNotFoundError()
            }
            const patientExist = await this.patientRepository.getPatientById(appointmentReq.identificacion_paciente)
            if(!patientExist){     
                throw new RecordNotFoundError()
            }
            const appointmentDb = await this.appointmentRepository.createAppointment(appointmentReq) 
            const appointment: Appointment = mapAppointment(appointmentDb, doctorExist)
            return appointment
        } catch (error){
            throw new CreationError("Failed to create appointment from service")
        }
    }

    public async getAppointmentById(id: number): Promise<Appointment> {
        try {
            const appointmentDb =  await this.appointmentRepository.getAppointmentById(id)
            const doctor = await this.doctorRepository.getDoctorById(appointmentDb.id_doctor)
            const appointment: Appointment = mapAppointment(appointmentDb, doctor)
            return appointment
        } catch (error) {
            logger.error('Failed to get appointment from service')
            throw new RecordNotFoundError()
        }
    }

   public async deleteAppointment(id: number): Promise<void> {      
        try {
            const appointmentDb =  await this.appointmentRepository.getAppointmentById(id)
            if(!appointmentDb){
                throw new RecordNotFoundError()
            } else {
                await this.appointmentRepository.deleteAppointment(id)
            }
        } catch (error) {
            logger.error('Failed to delete appointment from service')
            throw new DeleteError("Failed to delete appointment from service")
        }
    }
}


function mapAppointment(appointmentDb: AppointmentResDB, doctor: Doctor): Appointment {
    const appointment: Appointment = {
        identificacion_paciente: appointmentDb.identificacion_paciente, 
        especialidad:appointmentDb.especialidad,
        doctor: `${doctor.nombre} ${doctor.apellido}`,
        consultorio: doctor.consultorio,
        horario: appointmentDb.horario
    }
    return appointment
}