using Canvas.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Courier.Core;
using Umbraco.Courier.Core.Logging;
using Umbraco.Courier.Core.ProviderModel;
using Umbraco.Courier.DataResolvers;
using Umbraco.Courier.ItemProviders;

namespace Canvas.Courier
{
  //  public class CanvasDataResolver : PropertyDataResolverProvider
  //  {
  //      private enum Direction
  //      {
  //          Extracting,
  //          Packaging
  //      }

  //      /// <summary>
  //      /// Gets the editor alias.
  //      /// </summary>
  //      /// <value>
  //      /// The editor alias.
  //      /// </value>
		//public override string EditorAlias
  //      {
  //          get
  //          {
  //              return "Canvas.Editor";
  //          }
  //      }
  //      /// <summary>
  //      /// Extractings the property.
  //      /// </summary>
  //      /// <param name="item">The item.</param>
  //      /// <param name="propertyData">The property data.</param>
  //      public override void ExtractingProperty(Item item, ContentProperty propertyData)
  //      {
  //          ReplacePropertyDataIds(item, propertyData, Direction.Extracting);
  //      }

  //      /// <summary>
  //      /// Packages the property.
  //      /// </summary>
  //      /// <param name="item">The item.</param>
  //      /// <param name="propertyData">The property data.</param>
		//public override void PackagingProperty(Item item, ContentProperty propertyData)
  //      {
  //          ReplacePropertyDataIds(item, propertyData, Direction.Packaging);
  //      }

  //      /// <summary>
  //      /// Replaces the property data Ids.
  //      /// </summary>
  //      /// <param name="item">The item.</param>
  //      /// <param name="propertyData">The property data.</param>
  //      /// <param name="direction">The direction.</param>
  //      private void ReplacePropertyDataIds(Item item, ContentProperty propertyData, Direction direction)
  //      {
  //          if (propertyData != null && propertyData.Value != null)
  //          {
  //              var dataType = ExecutionContext.DatabasePersistence.RetrieveItem<DataType>(new ItemIdentifier(propertyData.DataType.ToString(),
  //                  ItemProviderIds.dataTypeItemProviderGuid));

  //              //Deserialize the value of the current Property to an ArchetypeModel and set additional properties before converting values
  //              var sourceJson = propertyData.Value.ToString();
  //              var canvas = JsonConvert.DeserializeObject<CanvasModel>(sourceJson);

  //              // serialize the Archetype back to a string
  //              propertyData.Value = JsonConvert.SerializeObject(canvas, Formatting.None);
                
  //          }
  //      }

  //  }
}
