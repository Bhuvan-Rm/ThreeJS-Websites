import React, {
    useRef,
    useState,
    useCallback,
    forwardRef,
    useEffect,
    useImperativeHandle
} from "react";
import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    BloomPlugin,
    GammaCorrectionPlugin,
    mobileAndTabletCheck,
} from "webgi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger)
import { scrollAnimation } from "../lib/scroll-animation"



const WebGiViewer = forwardRef((props, ref) => {
    const canvasRef = useRef(null);
    const [viewerRef, setViewerRef] = useState(null);
    const [targetRef, setTargetRef] = useState(null);
    const [cameraRef, setCameraRef] = useState(null);
    const [positionRef, setPositionRef] = useState(null);
    const canvasContainerRef = useRef(null);
    const [previewMode,setPreviewMode] = useState(false);
    const [isMobile,setIsMobile] = useState(null);

    useImperativeHandle(ref, () => ({
        triggerPreview() {
            setPreviewMode(true);
            canvasContainerRef.current.style.pointerEvents = "all";
            props.contentRef.current.style.opacity = "0";
            gsap.to(positionRef, {
                x: 13.04,
                y: -2.01,
                z: 2.29,
                duration: 2,
                onUpdate: () => {
                    viewerRef.setDirty()
                    cameraRef.positionTargetUpdated(true)
                }
            });
            gsap.to(targetRef, { x: 0, y: 0.0, z: 0.0, duration: 2 })
            viewerRef.scene.activeCamera.setCameraOptions({controlsEnabled:true})
        }
    }));

    const memoizedScrollAnimation = useCallback(
        (position, target,isMobile, onUpdate) => {
            if (position && target && onUpdate) {
                scrollAnimation(position, target,isMobile, onUpdate);
            }
        }, []
    )

    const setupViewer = useCallback(async () => {

        // Initialize the viewer
        const viewer = new ViewerApp({
            canvas: canvasRef.current,
        });

        setViewerRef(viewer)
        const isMobileorTablet = mobileAndTabletCheck()
        setIsMobile(isMobileorTablet);

        // Add some plugins
        const manager = await viewer.addPlugin(AssetManagerPlugin)

        const camera = viewer.scene.activeCamera;
        const position = camera.position;
        const target = camera.target;

        setCameraRef(camera)
        setPositionRef(position)
        setTargetRef(target)

        // Add plugins individually.
        await viewer.addPlugin(GBufferPlugin)
        await viewer.addPlugin(new ProgressivePlugin(32))
        await viewer.addPlugin(new TonemapPlugin(true))
        await viewer.addPlugin(SSRPlugin)
        await viewer.addPlugin(SSAOPlugin)
        await viewer.addPlugin(BloomPlugin)
        await viewer.addPlugin(GammaCorrectionPlugin)


        // This must be called once after all plugins are added.
        viewer.renderer.refreshPipeline();

        await manager.addFromPath("scene-black.glb");

        viewer.getPlugin(TonemapPlugin).config.clipBackground = true;

        // Load an environment map if not set in the glb file
        // await viewer.scene.setEnvironment(
        //     await manager.importer!.importSinglePath<ITexture>(
        //         "./assets/environment.hdr"
        //     )
        // );
        viewer.scene.activeCamera.setCameraOptions({
            controlsEnabled: false
        });

        if(isMobileorTablet){
            position.set(-16.7,1.17,11.7);
            target.set(0,1.37,0)
            props.contentRef.current.className = "mobile-or-tablet"
        }

        window.scrollTo(0, 0);

        let needsUpdate = true;
        const onUpdate = () => {
            needsUpdate = true;
            viewer.setDirty();

        }

        viewer.addEventListener('preFrame', () => {
            if (needsUpdate) {
                camera.positionTargetUpdated(true);
                needsUpdate = false
            }

        })

        memoizedScrollAnimation(position, target,isMobileorTablet, onUpdate);

    }, []);

    useEffect(() => {
        setupViewer()
    }, []);

    const handleExit = useCallback(()=>{
        viewerRef.scene.activeCamera.setCameraOptions({controlsEnabled:false})
        canvasContainerRef.current.style.pointerEvents = "none";
        props.contentRef.current.style.opacity = "1";
        setPreviewMode(false);
        gsap
        .to(positionRef, {
            x: 1.56,
            y: 5.0,
            z: 0.011,
            scrollTrigger: {
                trigger: ".display-section",
                start: "top bottom",
                end: "top top",
                scrub: 2,
                immediateRender: false
            },
            onUpdate: () => {
                viewerRef.setDirty();
                cameraRef.positionTargetUpdated(true)
            }
            
        });
        gsap.to(targetRef, {
            x: -0.55,
            y: 0.32,
            z: 0.0,
            scrollTrigger: {
                trigger: ".display-section",
                start: "top bottom",
                end: "top top",
                scrub: 2,
                immediateRender: false
            },
            onUpdate
        })
    },[canvasContainerRef,viewerRef,positionRef,cameraRef,targetRef]);



    return (
        <div id="webgi-canvas-container" ref={canvasContainerRef}>
            <canvas id="webgi-canvas" ref={canvasRef} />
            {
                previewMode && (
                    <button className="button" onClick={handleExit}>Exit</button>
                )
            }
        </div>
    );
});

export default WebGiViewer;