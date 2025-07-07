using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class ccCamps
    {

        [Key]
        public int Id { get; set; }
        public int cam_id { get; set; }
        public int cli_id { get; set; }
        public string? cam_descripcion { get; set; }
        public int cam_activo { get; set; }
        public int cam_ModoManual { get; set; }
        public int cam_modpredictivo { get; set; }
        public int cam_TipoJobs { get; set; }
        public int cam_tNoContesta { get; set; }
        public int cam_SortColumns { get; set; }
        public int cam_ocupado { get; set; }
        public int cam_nocontesto { get; set; }
        public int cam_graba { get; set; }
        public int cam_fax { get; set; }
        public int cam_callratio { get; set; }
        public int cam_inter_ocupado { get; set; }
        public int cam_inter_nocontesto { get; set; }
        public int cam_inter_graba { get; set; }
        public int cam_inter_fax { get; set; }
        public int cam_NoInt_ocupado { get; set; }
        public int cam_NoInt_nocontesto { get; set; }
        public int cam_NoInt_graba { get; set; }
        public int cam_NoInt_fax { get; set; }
        public bool cam_procesando { get; set; }
        public string cam_dsn { get; set; }
        public string cam_sql { get; set; }
        public int cam_tnotas { get; set; }
        public int cam_tDialAfterWU { get; set; }
        public int cam_tDialAfterDLG { get; set; }
        public int cam_fDialOnWU { get; set; }
        public int cam_fDialOnDLG { get; set; }
        public int cam_tDialBeforeWU { get; set; }
        public int cam_tDialBeforeReady { get; set; }
        public int cam_bValidaTel { get; set; }
        public int? cam_bNew { get; set; }
        public bool cam_ShowCalifWnd { get; set; }
        public bool cam_StartTimerOnHangUp { get; set; }
        public DateTime cam_fCreate { get; set; }
        public decimal? cam_MaxDlrXage { get; set; }
        public string Ani { get; set; }
        public int? Idarea { get; set; }
        public bool Editablecallkey { get; set; }
        public int Itipodial { get; set; }
        public int Detectanswermachine { get; set; }
        public int Detectvoicemail { get; set; }
        public int Compliance { get; set; }
        public int Progdial { get; set; }
        public bool Exccallback { get; set; }
        public bool Keepdial { get; set; }
        public float Aggressionfactor { get; set; }
        public bool Dialorder { get; set; }
        public string Dialprefix { get; set; }
        public bool Listenmanualcall { get; set; }
        public bool Stoprecording { get; set; }
        public bool Abandoncallback { get; set; }
        public int t_autoCB { get; set; }
        public int? id_anilist { get; set; }
        public string Dialprefixman { get; set; }
        public string Dialprefixxfe { get; set; }
        public int Tdialonwrapup { get; set; }
        public int cam_maxqueue { get; set; }
        public int Dncscrub { get; set; }
        public string Calleriddesc { get; set; }
        public int Timezonerule { get; set; }
        public int? Surveycamid { get; set; }
        public int Callsbysurvey { get; set; }
        public int Ivrscript { get; set; }
        public int Surveypctg { get; set; }
        public int call_record { get; set; }
        public bool Startstoprecording { get; set; }
        public bool Leaverecmessage { get; set; }
        public bool Manualcallonchat { get; set; }
        public bool Callbacksurveyagent { get; set; }
        public bool Callbacksurveyclient { get; set; }
        public int? Funcespdtmf { get; set; }
        public string Siphdrformat { get; set; }
        public int cam_inter_cancelled { get; set; }
        public string Prefijo { get; set; }
        public bool Holdcall { get; set; }
        public bool? Exitassisted { get; set; }
        public int? Rotativealgo { get; set; }
        public bool? Previewdiscard { get; set; }
        public int CamTpreview { get; set; }
        public int Timespreview { get; set; }
        public int? odbc_id { get; set; }
        public int? Camptype { get; set; }
        public int Timesdiscard { get; set; }
        public int? Selectrotativeani { get; set; }
        public bool? Messagingorder { get; set; }
        public bool? Autostart { get; set; }
        public bool? Recordhold { get; set; }
        public Guid Rowguid { get; set; }
    }


}
