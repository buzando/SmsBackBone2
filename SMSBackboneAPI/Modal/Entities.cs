using Contract;
using Microsoft.EntityFrameworkCore;
using Modal.Model;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal
{
    public class Entities : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var conn = Common.ConfigurationManagerJson("ConnectionStrings:Conexion");
            optionsBuilder.UseSqlServer(conn);
            base.OnConfiguring(optionsBuilder);
        }
        public DbSet<Users> Users { get; set; }
        public DbSet<UserAccounRecovery> UserAccounRecovery { get; set; }
        public DbSet<rooms> Rooms { get; set; }
        public DbSet<clients> clients { get; set; }
        public DbSet<Roles> Roles { get; set; }
        public DbSet<roomsbyuser> roomsbyuser { get; set; }
        public DbSet<creditcards> creditcards { get; set; }
        public DbSet<MyNumbers> MyNumbers { get; set; }
        public DbSet<BillingInformation> BillingInformation { get; set; }
        public DbSet<CreditRecharge> CreditRecharge { get; set; }
        public DbSet<CreditRechargeOpenPay> CreditRechargeOpenPay { get; set; }
        public DbSet<AmountNotification> AmountNotification { get; set; }
        public DbSet<AmountNotificationUser> AmountNotificationUser { get; set; }
        public DbSet<BlackList> BlackList { get; set; }
        public DbSet<blacklistcampains> blacklistcampains { get; set; }
        public DbSet<Campaigns> Campaigns { get; set; }
        public DbSet<CampaignContacts> CampaignContacts { get; set; }
        public DbSet<CampaignRecycleSettings> CampaignRecycleSettings { get; set; }

        public DbSet<Template> Template { get; set; }

        public DbSet<CampaignSchedules> CampaignSchedules { get; set; }

        public DbSet<ClientAccess> ClientAccess { get; set; }
        public DbSet<tpm_CampaignContacts> tpm_CampaignContacts { get; set; }  
        public DbSet<CampaignContactScheduleSend> CampaignContactScheduleSend { get; set; }
        public DbSet<IFTLadas> IFTLadas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ClientRoomSummaryDTO>().HasNoKey();
            modelBuilder.Entity<CampaignFullResponse>().HasNoKey();
            modelBuilder.Entity<CampaignRecycleSettingDto>().HasNoKey(); 
            modelBuilder.Entity<CampaignScheduleDto>().HasNoKey();
            modelBuilder.Entity<CampaignContactDto>().HasNoKey();
            modelBuilder.Entity<CampaignContactScheduleSendDTO>().HasNoKey();
            modelBuilder.Entity<CampaignFullResponse>().Ignore(c => c.RecycleSetting);
            base.OnModelCreating(modelBuilder);
        }
        public DbSet<ClientRoomSummaryDTO> ClientRoomSummaryDTO { get; set; }
        public DbSet<CampaignFullResponse> CampaignFullResponse { get; set; }



    }
}
