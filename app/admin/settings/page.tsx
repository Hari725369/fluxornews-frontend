'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import RoleGate from '@/components/admin/RoleGate';
import { configAPI, uploadAPI } from '@/lib/api';
import Switch from '@/components/ui/Switch';
import Image from 'next/image';
import {
    FaFacebook, FaXTwitter, FaInstagram, FaLinkedin, FaYoutube,
    FaRegClock, FaUserPen, FaCalendarDays, FaMoon, FaComments,
    FaShareNodes, FaBookOpen, FaTags, FaMagnifyingGlass, FaEnvelope,
    FaEarthAmericas, FaCloudArrowUp, FaPalette, FaGears
} from 'react-icons/fa6';

type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Layout
    const [columnCount, setColumnCount] = useState(3);

    // Branding
    const [logo, setLogo] = useState('');
    const [favicon, setFavicon] = useState('');
    const [logoUploading, setLogoUploading] = useState(false);
    const [faviconUploading, setFaviconUploading] = useState(false);

    // Features
    const [showLatestNews, setShowLatestNews] = useState(true);
    const [enableEmailSubscribe, setEnableEmailSubscribe] = useState(true);
    const [enableTags, setEnableTags] = useState(true);
    const [enableComments, setEnableComments] = useState(true);
    const [enableDarkMode, setEnableDarkMode] = useState(true);
    const [enableReadingTime, setEnableReadingTime] = useState(true);
    const [enableRelatedArticles, setEnableRelatedArticles] = useState(true);
    const [enableSocialShare, setEnableSocialShare] = useState(true);
    const [enableSearch, setEnableSearch] = useState(true);
    const [showAuthorName, setShowAuthorName] = useState(false);
    const [showCountryName, setShowCountryName] = useState(false);
    const [showDateTime, setShowDateTime] = useState(true);
    const [showSignInButton, setShowSignInButton] = useState(true);
    const [enableSaveForLater, setEnableSaveForLater] = useState(true);
    const [showPostIntro, setShowPostIntro] = useState(true);

    // Social Links
    const [socialLinks, setSocialLinks] = useState<Record<SocialPlatform, { url: string; enabled: boolean }>>({
        facebook: { url: '', enabled: false },
        twitter: { url: '', enabled: false },
        instagram: { url: '', enabled: false },
        linkedin: { url: '', enabled: false },
        youtube: { url: '', enabled: false }
    });

    // Footer
    const [footerText, setFooterText] = useState({
        copyrightText: '',
        description: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await configAPI.get();
            if (response.success) {
                const data = response.data as any;

                if (data.homeLayout?.columns) setColumnCount(data.homeLayout.columns);
                if (data.branding) {
                    setLogo(data.branding.logo || '');
                    setFavicon(data.branding.favicon || '');
                }
                if (data.features) {
                    setShowLatestNews(data.features.showLatestNews ?? true);
                    setEnableEmailSubscribe(data.features.enableEmailSubscribe ?? true);
                    setEnableTags(data.features.enableTags ?? true);
                    setEnableComments(data.features.enableComments ?? true);
                    setEnableDarkMode(data.features.enableDarkMode ?? true);
                    setEnableReadingTime(data.features.enableReadingTime ?? true);
                    setEnableRelatedArticles(data.features.enableRelatedArticles ?? true);
                    setEnableSocialShare(data.features.enableSocialShare ?? true);
                    setEnableSearch(data.features.enableSearch ?? true);
                    setShowAuthorName(data.features.showAuthorName ?? false);
                    setShowCountryName(data.features.showCountryName ?? false);
                    setShowDateTime(data.features.showDateTime ?? true);
                    setShowSignInButton(data.features.showSignInButton ?? true);
                    setEnableSaveForLater(data.features.enableSaveForLater ?? true);
                    setShowPostIntro(data.features.showPostIntro ?? true);
                }
                if (data.socialLinks) {
                    const platforms: SocialPlatform[] = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
                    const newSocialLinks: any = {};
                    platforms.forEach(platform => {
                        newSocialLinks[platform] = {
                            url: data.socialLinks[platform]?.url || '',
                            enabled: data.socialLinks[platform]?.enabled || false
                        };
                    });
                    setSocialLinks(newSocialLinks);
                }
                if (data.footer) {
                    setFooterText({
                        copyrightText: data.footer.copyrightText || '',
                        description: data.footer.description || ''
                    });
                }
            }
        } catch (err) {
            console.error('Failed to load config', err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File, type: 'logo' | 'favicon') => {
        try {
            if (type === 'logo') setLogoUploading(true);
            else setFaviconUploading(true);

            const response = await uploadAPI.uploadImage(file, 'branding');
            if (response.success && response.data?.url) {
                if (type === 'logo') setLogo(response.data.url);
                else setFavicon(response.data.url);
                setSuccess(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setError(`Failed to upload ${type}: ${err.message}`);
        } finally {
            if (type === 'logo') setLogoUploading(false);
            else setFaviconUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await configAPI.update({
                homeLayout: { columns: columnCount },
                branding: { logo, favicon },
                features: {
                    showLatestNews, enableEmailSubscribe, enableTags, enableComments, enableDarkMode,
                    enableReadingTime, enableRelatedArticles, enableSocialShare,
                    enableSearch, showAuthorName, showCountryName, showDateTime,
                    showSignInButton, enableSaveForLater, showPostIntro
                },
                socialLinks,
                footer: footerText
            });
            setSuccess('Settings saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F0F]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }

    const featureItems = [
        { label: 'Latest News Section', state: showLatestNews, setState: setShowLatestNews, desc: 'Display Latest News on homepage', icon: <FaBookOpen /> },
        { label: 'Publish Date', state: showDateTime, setState: setShowDateTime, desc: 'Show publication timestamp', icon: <FaCalendarDays /> },
        { label: 'Reading Time', state: enableReadingTime, setState: setEnableReadingTime, desc: 'Show estimated reading time', icon: <FaRegClock /> },
        { label: 'Author Name', state: showAuthorName, setState: setShowAuthorName, desc: 'Display author credits', icon: <FaUserPen /> },
        { label: 'Save for Later', state: enableSaveForLater, setState: setEnableSaveForLater, desc: 'Allow users to bookmark articles', icon: <FaBookOpen /> },
        { label: 'Social Share', state: enableSocialShare, setState: setEnableSocialShare, desc: 'Show sharing buttons', icon: <FaShareNodes /> },
        { label: 'Post Intro', state: showPostIntro, setState: setShowPostIntro, desc: 'Show article summary/intro', icon: <FaBookOpen /> },
        { label: 'Sign In Button', state: showSignInButton, setState: setShowSignInButton, desc: 'Show login button in header', icon: <FaUserPen /> },
        { label: 'Dark Mode', state: enableDarkMode, setState: setEnableDarkMode, desc: 'Allow theme switching', icon: <FaMoon /> },
        { label: 'Comments', state: enableComments, setState: setEnableComments, desc: 'Enable discussions', icon: <FaComments /> },
        { label: 'Related Articles', state: enableRelatedArticles, setState: setEnableRelatedArticles, desc: 'Suggest similar content', icon: <FaBookOpen /> },
        { label: 'Tags System', state: enableTags, setState: setEnableTags, desc: 'Organize content with tags', icon: <FaTags /> },
        { label: 'Search', state: enableSearch, setState: setEnableSearch, desc: 'Global site search', icon: <FaMagnifyingGlass /> },
        { label: 'Email Subscribe', state: enableEmailSubscribe, setState: setEnableEmailSubscribe, desc: 'Newsletter signup form', icon: <FaEnvelope /> },
        { label: 'Country Name', state: showCountryName, setState: setShowCountryName, desc: 'Show location in metadata', icon: <FaEarthAmericas /> },
    ];

    return (
        <RoleGate allowedRoles={['superadmin']}>
            <div className="p-6 max-w-5xl mx-auto space-y-10 pb-20">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Site Settings
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Manage your website's features, social connections, and footer content.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/dashboard">
                            <Button variant="secondary" size="lg" className="gap-2">
                                Back
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-white min-w-[140px] shadow-lg shadow-primary/20"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Notifications */}
                {(error || success) && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fadeIn ${error ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300' :
                        'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-300'
                        }`}>
                        {error || success}
                    </div>
                )}

                <div className="space-y-12">
                    {/* Features Grid */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <FaGears className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Features & Functionality</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle underlying site features</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featureItems.map((feature) => (
                                <div key={feature.label} className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-none transition-all duration-200 flex items-start justify-between group h-full">
                                    <div className="flex gap-4">
                                        <div className="mt-1 text-gray-400 group-hover:text-primary transition-colors text-lg">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white leading-tight mb-1">{feature.label}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                    <Switch checked={feature.state} onChange={feature.setState} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <FaShareNodes className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Social Connections</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your social media links</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(Object.keys(socialLinks) as SocialPlatform[]).map((platform) => (
                                <div key={platform} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl shadow-sm ${platform === 'facebook' ? 'bg-[#1877F2]/10 text-[#1877F2]' :
                                            platform === 'twitter' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' :
                                                platform === 'instagram' ? 'bg-pink-500/10 text-pink-600' :
                                                    platform === 'linkedin' ? 'bg-[#0077b5]/10 text-[#0077b5]' :
                                                        'bg-[#FF0000]/10 text-[#FF0000]'
                                            }`}>
                                            {platform === 'facebook' && <FaFacebook />}
                                            {platform === 'twitter' && <FaXTwitter />}
                                            {platform === 'instagram' && <FaInstagram />}
                                            {platform === 'linkedin' && <FaLinkedin />}
                                            {platform === 'youtube' && <FaYoutube />}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{platform}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${socialLinks[platform].enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {socialLinks[platform].enabled ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={socialLinks[platform].enabled}
                                            onChange={(checked) => setSocialLinks({
                                                ...socialLinks,
                                                [platform]: { ...socialLinks[platform], enabled: checked }
                                            })}
                                        />
                                    </div>
                                    <input
                                        type="url"
                                        value={socialLinks[platform].url}
                                        onChange={(e) => setSocialLinks({
                                            ...socialLinks,
                                            [platform]: { ...socialLinks[platform], url: e.target.value }
                                        })}
                                        placeholder={`https://${platform}.com/...`}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Content */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                            <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                <FaBookOpen className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Footer Content</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Customize site footer information</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Copyright Text</label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Appears at the very bottom of your site.</p>
                                    <input
                                        type="text"
                                        value={footerText.copyrightText}
                                        onChange={(e) => setFooterText({ ...footerText, copyrightText: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                        placeholder="© 2024 Your Site Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Site Description</label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Brief summary displayed in the footer.</p>
                                    <textarea
                                        value={footerText.description}
                                        onChange={(e) => setFooterText({ ...footerText, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none leading-relaxed"
                                        placeholder="A short description of your publication..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGate>
    );
}
