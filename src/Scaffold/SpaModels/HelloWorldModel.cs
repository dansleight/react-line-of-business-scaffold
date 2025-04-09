using System;

namespace Scaffold.SpaModels;

public class HelloWorldModel
{
    #region Properties

    public string Message { get; set; }

    #endregion

    #region Constructor

    public HelloWorldModel()
    {
        Message = "Hello There";
    }

    #endregion
}
