using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Canvas.Models
{
    public class ArchetypeModel
    {
        [JsonProperty("fieldsets")]
        public List<ArchetypeFieldsetModel> Fieldsets { get; set; }
    }

    public class ArchetypeFieldsetModel
    {
        [JsonProperty("alias")]
        public string Alias { get; set; }

        [JsonProperty("disabled")]
        public bool Disabled { get; set; }

        [JsonProperty("properties")]
        public List<ArchetypeProperty> Properties;

        public ArchetypeFieldsetModel()
        {
            Properties = new List<ArchetypeProperty>();
        }
    }

    public class ArchetypeProperty
    {
        [JsonProperty("alias")]
        public string Alias { get; set; }

        [JsonProperty("value")]
        public string Value { get; set; }
    }

    // Control

    public class ArchetypeControlModel
    {
        [JsonProperty("fieldsets")]
        public List<ArchetypeControlFieldsetModel> Fieldsets { get; set; }
    }

    public class ArchetypeControlFieldsetModel
    {
        [JsonProperty("alias")]
        public string Alias { get; set; }

        [JsonProperty("disabled")]
        public bool Disabled { get; set; }

        [JsonProperty("properties")]
        public List<ArchetypeProperty> Properties = new List<ArchetypeProperty>();
    }
}
