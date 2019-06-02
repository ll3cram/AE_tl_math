//
//  tl_defaultArb.h
//  tlMath
//
//  Created by Hercules on 20/05/2019.
//

#ifndef tl_defaultArb_h
#define tl_defaultArb_h

static std::string defaultArb = R"=====(
{
    "effectInfo":{
        "effectName":"tlMath",
        "pluginVesion":"1.15",
        "minimalPluginVersion":"1.15",
        "category":"default",
        "presetName":"default_preset",
        "description":"simple default effect"
    },
    "effectMode":{
        "gl_modeB":true,
        "expr_modeB":false,
        "evalModeB":false,
        "geoshModeB":false
    },
    "gl_expression":{
        "gl_frag_sh":"#version 330 // glsls version for opengl 3.3\\nuniform sampler2D layerTex; //call the layer source\\nuniform float var1;// call somes variables from the ui\\nuniform float var2;\\nuniform float var3;\\nuniform float var4;\\nuniform vec3 cl1; // call the color param number 1\\nuniform float multiplier16bit; //proper to AE 16 bits depth.\\nin vec4 out_pos;\\nin vec2 out_uvs;\\nout vec4 fragColorOut;\\n// to use instead of texture(sampler2D, vec2 uv) because of swizzle RGBA/ ARGBs\\nvec4 loadTextureFromAE (sampler2D tex2d, vec2 uv)\\n{\\n    vec4 textureIn = texture( tex2d, uv.xy);\\n    textureIn =  textureIn * multiplier16bit;\\n    textureIn= vec4( textureIn.g,  textureIn.b,  textureIn.a,  textureIn.r);\\n    textureIn= vec4( textureIn.a *  textureIn.r,  textureIn.a *  textureIn.g,  textureIn.a * textureIn.b,  textureIn.a);\\n    return  textureIn ;\\n}\\n\\nvoid main(void)\\n{\\n    fragColorOut= loadTextureFromAE(layerTex, out_uvs.xy);\\n    fragColorOut.r *=var1*cl1.r; //have fun to mix the color from layer/ slider intensity and color param\\n    fragColorOut.g *= var2*cl1.g;\\n    fragColorOut.b *= var3*cl1.b;\\n    fragColorOut.a *= var4;\\n}",
        "gl_vert_sh":"#version 330 \\n in vec4 Position;\\nin vec2 UVs;\\nout vec4 out_pos;\\nout vec2 out_uvs;\\nuniform mat4 ModelviewProjection;\\nvoid main(void)\\n{\\nout_pos = ModelviewProjection * Position; \\n gl_Position = out_pos; \\nout_uvs = UVs;\\n}",
        "gl_geo_sh":"//write here your geometry shader",
		"gl_frag_error" : "not analysed",
		"gl_vert_error" : "not analysed",
        "gl_geo_error"  : "not analysed"
    },
    "math_expression":{
        "redExpr":"in_red",
        "greenExpr":"in_green",
        "blueExpr":"in_blue",
        "alphaExpr":"1",
		"red_error": "not analysed",
		"green_error" : "not analysed",
		"blue_error" : "not_analysed",
		"alpha_error" : "not_analysed"
    },
	 "flags":{
        "needsPixelAroundB":false,
        "pixelsCallExternalInputB":false,
        "needsLumaB":false,
        "presetHasWideInputB":false
    },
    "composition":{
        "resolution":"resolution",
        "time_sec":"time",
        "time_frame":"timef",
        "frame_rate":"fps"
    },
    "gui_settings":{
        "sliderGrp":{
            "grpVisibleB":true,
            "grpName":"Slider Group",
            "slider_1":{
                "visibleB":true,
                "name":"slider_1"
            },
            "slider_2":{
                "visibleB":true,
                "name":"slider_2"
            },
            "slider_3":{
                "visibleB":true,
                "name":"slider_3"
            },
            "slider_4":{
                "visibleB":true,
                "name":"slider_4"
            },
            "slider_5":{
                "visibleB":true,
                "name":"slider_5"
            },
            "slider_6":{
                "visibleB":true,
                "name":"slider_6"
            },
            "slider_7":{
                "visibleB":true,
                "name":"slider_7"
            },
            "slider_8":{
                "visibleB":true,
                "name":"slider_8"
            },
            "slider_9":{
                "visibleB":true,
                "name":"slider_9"
            },
            "slider_10":{
                "visibleB":true,
                "name":"slider_10"
            }
        },
        "pointGrp":{
            "grpVisibleB":true,
            "grpName":"3d Point Group",
            "point_1":{
                "visibleB":true,
                "name":"point_1"
            },
            "point_2":{
                "visibleB":true,
                "name":"point_2"
            },
            "point_3":{
                "visibleB":true,
                "name":"point_3"
            },
            "point_4":{
                "visibleB":true,
                "name":"point_4"
            },
            "point_5":{
                "visibleB":true,
                "name":"point_5"
            },
            "point_6":{
                "visibleB":true,
                "name":"point_6"
            },
            "point_7":{
                "visibleB":true,
                "name":"point_7"
            },
            "point_8":{
                "visibleB":true,
                "name":"point_8"
            },
            "point_9":{
                "visibleB":true,
                "name":"point_9"
            },
            "point_10":{
                "visibleB":true,
                "name":"point_10"
            }
        },
        "colorGrp":{
            "grpVisibleB":true,
            "grpName":"3d color Group",
            "color_1":{
                "visibleB":true,
                "name":"color_1"
            },
            "color_2":{
                "visibleB":true,
                "name":"color_2"
            },
            "color_3":{
                "visibleB":true,
                "name":"color_3"
            },
            "color_4":{
                "visibleB":true,
                "name":"color_4"
            },
            "color_5":{
                "visibleB":true,
                "name":"color_5"
            },
            "color_6":{
                "visibleB":true,
                "name":"color_6"
            },
            "color_7":{
                "visibleB":true,
                "name":"color_7"
            },
            "color_8":{
                "visibleB":true,
                "name":"color_8"
            },
            "color_9":{
                "visibleB":true,
                "name":"color_9"
            },
            "color_10":{
                "visibleB":true,
                "name":"color_10"
            }
        },
        "cboxGrp":{
            "grpVisibleB":true,
            "grpName":"check box Group",
            "cbox_1":{
                "visibleB":true,
                "name":"cbox_1"
            },
            "cbox_2":{
                "visibleB":true,
                "name":"cbox_2"
            },
            "cbox_3":{
                "visibleB":true,
                "name":"cbox_3"
            },
            "cbox_4":{
                "visibleB":true,
                "name":"cbox_4"
            },
            "cbox_5":{
                "visibleB":true,
                "name":"cbox_5"
            },
            "cbox_6":{
                "visibleB":true,
                "name":"cbox_6"
            },
            "cbox_7":{
                "visibleB":true,
                "name":"cbox_7"
            },
            "cbox_8":{
                "visibleB":true,
                "name":"cbox_8"
            },
            "cbox_9":{
                "visibleB":true,
                "name":"cbox_9"
            },
            "cbox_10":{
                "visibleB":true,
                "name":"cbox_10"
            }
        },
        "layerGrp":{
            "extLGrpVisible":true,
            "extLGrpName":"Layer Group",
            "current_layer":{
                "visibleB":true,
                "name":"texture0"
            },
            "extLayer_1":{
                "visibleB":true,
                "name":"texture1"
            }
        }
    }
}
)=====";


#endif /* tl_defaultArb_h */