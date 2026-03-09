namespace EgyptianLawyers.Api.Domain.Entities;

public class HelpPostReply
{
    public Guid Id { get; set; }
    public Guid HelpPostId { get; set; }
    public Guid LawyerId { get; set; }
    public Guid? ParentReplyId { get; set; }
    public string? Comment { get; set; }
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public HelpPost HelpPost { get; set; } = null!;
    public Lawyer Lawyer { get; set; } = null!;
    public HelpPostReply? ParentReply { get; set; }
    public List<HelpPostReply> ChildReplies { get; set; } = [];
}

